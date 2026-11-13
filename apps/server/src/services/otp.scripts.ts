// Keep limits and code consumption atomic across concurrent API requests.
export const REQUEST_OTP_SCRIPT = `
local attempts = tonumber(redis.call('GET', KEYS[3]) or '0')
if attempts >= 5 then
    return redis.call('TTL', KEYS[3])
end
local emailCount = redis.call('INCR', KEYS[1])
if emailCount == 1 then redis.call('EXPIRE', KEYS[1], 900) end
local ipCount = redis.call('INCR', KEYS[2])
if ipCount == 1 then redis.call('EXPIRE', KEYS[2], 900) end
if emailCount > 5 or ipCount > 20 then
    return math.max(redis.call('TTL', KEYS[1]), redis.call('TTL', KEYS[2]), 1)
end
redis.call('SET', KEYS[4], ARGV[1], 'EX', 100)
return 0
`;

export const VERIFY_OTP_SCRIPT = `
local attempts = tonumber(redis.call('GET', KEYS[2]) or '0')
if attempts >= 5 then return -1 end
local stored = redis.call('GET', KEYS[1])
if not stored then return 0 end
if stored ~= ARGV[1] then
    attempts = redis.call('INCR', KEYS[2])
    if attempts == 1 then redis.call('EXPIRE', KEYS[2], 900) end
    if attempts >= 5 then
        redis.call('DEL', KEYS[1])
        return -1
    end
    return 0
end
redis.call('DEL', KEYS[1], KEYS[2])
return 1
`;
