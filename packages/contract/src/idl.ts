export const IDL = {
  "address": "8Gj7Nuc8uQZjA9h4XrfQ7RCbuKFW74mhk6nbQ8cdjZue",
  "metadata": {
    "name": "contract",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "authorize_platform",
      "discriminator": [
        22,
        41,
        216,
        4,
        57,
        184,
        17,
        15
      ],
      "accounts": [
        {
          "name": "quiz_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  105,
                  122
                ]
              },
              {
                "kind": "arg",
                "path": "quiz_id"
              },
              {
                "kind": "account",
                "path": "host"
              }
            ]
          }
        },
        {
          "name": "host",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "quiz_id",
          "type": "string"
        },
        {
          "name": "platform_pubkey",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "cancel_quiz",
      "discriminator": [
        243,
        172,
        187,
        47,
        86,
        64,
        57,
        55
      ],
      "accounts": [
        {
          "name": "quiz_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  105,
                  122
                ]
              },
              {
                "kind": "arg",
                "path": "quiz_id"
              },
              {
                "kind": "account",
                "path": "host"
              }
            ]
          }
        },
        {
          "name": "escrow_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "quiz_account"
              }
            ]
          }
        },
        {
          "name": "escrow_token_account",
          "docs": [
            "Escrow USDC token account"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "quiz_account"
              }
            ]
          }
        },
        {
          "name": "host_token_account",
          "docs": [
            "Host's USDC token account (ATA)"
          ],
          "writable": true
        },
        {
          "name": "host",
          "writable": true,
          "signer": true
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "quiz_id",
          "type": "string"
        }
      ]
    },
    {
      "name": "claim_prize",
      "discriminator": [
        157,
        233,
        139,
        121,
        246,
        62,
        234,
        235
      ],
      "accounts": [
        {
          "name": "quiz_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  105,
                  122
                ]
              },
              {
                "kind": "arg",
                "path": "quiz_id"
              },
              {
                "kind": "account",
                "path": "quiz_account.host_pub_key",
                "account": "QuizAccountShape"
              }
            ]
          }
        },
        {
          "name": "escrow_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "quiz_account"
              }
            ]
          }
        },
        {
          "name": "escrow_token_account",
          "docs": [
            "Escrow USDC token account"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "quiz_account"
              }
            ]
          }
        },
        {
          "name": "claim_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  97,
                  105,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "quiz_id"
              },
              {
                "kind": "arg",
                "path": "claim_token"
              }
            ]
          }
        },
        {
          "name": "claimer_token_account",
          "docs": [
            "Claimer's USDC token account (ATA, must pre-exist — frontend creates beforehand)"
          ],
          "writable": true
        },
        {
          "name": "claimer",
          "writable": true,
          "signer": true
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "quiz_id",
          "type": "string"
        },
        {
          "name": "claim_token",
          "type": "string"
        }
      ]
    },
    {
      "name": "create_quiz",
      "discriminator": [
        11,
        85,
        75,
        64,
        106,
        226,
        15,
        10
      ],
      "accounts": [
        {
          "name": "quiz_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  105,
                  122
                ]
              },
              {
                "kind": "arg",
                "path": "quiz_id"
              },
              {
                "kind": "account",
                "path": "host"
              }
            ]
          }
        },
        {
          "name": "usdc_mint",
          "docs": [
            "USDC mint account"
          ],
          "address": "FNvGsacFM6ApWceMkqyg3NWoZZqeHizZk9Q3ZSJMmkja"
        },
        {
          "name": "escrow_authority",
          "docs": [
            "Escrow authority PDA (never allocated, used only for signing token transfers)"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "quiz_account"
              }
            ]
          }
        },
        {
          "name": "escrow_token_account",
          "docs": [
            "Escrow token account — holds USDC for the quiz prize pool"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "quiz_account"
              }
            ]
          }
        },
        {
          "name": "host_token_account",
          "docs": [
            "Host's USDC token account (ATA, must pre-exist)"
          ],
          "writable": true
        },
        {
          "name": "nocturn_token_account",
          "docs": [
            "Nocturn platform fee USDC token account (must pre-exist)"
          ],
          "writable": true
        },
        {
          "name": "host",
          "writable": true,
          "signer": true
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "quiz_id",
          "type": "string"
        },
        {
          "name": "host_id",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "finalize_quiz",
      "discriminator": [
        203,
        75,
        80,
        218,
        52,
        90,
        148,
        140
      ],
      "accounts": [
        {
          "name": "quiz_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  105,
                  122
                ]
              },
              {
                "kind": "arg",
                "path": "quiz_id"
              },
              {
                "kind": "account",
                "path": "quiz_account.host_pub_key",
                "account": "QuizAccountShape"
              }
            ]
          }
        },
        {
          "name": "claim_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  97,
                  105,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "quiz_id"
              },
              {
                "kind": "arg",
                "path": "claim_token"
              }
            ]
          }
        },
        {
          "name": "platform_authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "quiz_id",
          "type": "string"
        },
        {
          "name": "claim_token",
          "type": "string"
        },
        {
          "name": "winner_email_hash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "rank",
          "type": "u8"
        },
        {
          "name": "expires_at",
          "type": "i64"
        }
      ]
    },
    {
      "name": "reclaim_expired",
      "discriminator": [
        125,
        185,
        48,
        75,
        0,
        71,
        93,
        98
      ],
      "accounts": [
        {
          "name": "quiz_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  105,
                  122
                ]
              },
              {
                "kind": "arg",
                "path": "quiz_id"
              },
              {
                "kind": "account",
                "path": "host"
              }
            ]
          }
        },
        {
          "name": "escrow_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "quiz_account"
              }
            ]
          }
        },
        {
          "name": "escrow_token_account",
          "docs": [
            "Escrow USDC token account"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "quiz_account"
              }
            ]
          }
        },
        {
          "name": "claim_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  97,
                  105,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "quiz_id"
              },
              {
                "kind": "arg",
                "path": "claim_token"
              }
            ]
          }
        },
        {
          "name": "host_token_account",
          "docs": [
            "Host's USDC token account (ATA)"
          ],
          "writable": true
        },
        {
          "name": "host",
          "writable": true,
          "signer": true
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "quiz_id",
          "type": "string"
        },
        {
          "name": "claim_token",
          "type": "string"
        }
      ]
    },
    {
      "name": "seal_quiz",
      "discriminator": [
        67,
        132,
        92,
        217,
        114,
        66,
        14,
        254
      ],
      "accounts": [
        {
          "name": "quiz_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  105,
                  122
                ]
              },
              {
                "kind": "arg",
                "path": "quiz_id"
              },
              {
                "kind": "account",
                "path": "quiz_account.host_pub_key",
                "account": "QuizAccountShape"
              }
            ]
          }
        },
        {
          "name": "platform_authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "quiz_id",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "ClaimAccount",
      "discriminator": [
        113,
        109,
        47,
        96,
        242,
        219,
        61,
        165
      ]
    },
    {
      "name": "QuizAccountShape",
      "discriminator": [
        218,
        154,
        160,
        100,
        187,
        255,
        163,
        151
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Unauthorized",
      "msg": "Only the property owner can perform this action"
    },
    {
      "code": 6001,
      "name": "AlreadyFinalized",
      "msg": "Quiz has already been finalized"
    },
    {
      "code": 6002,
      "name": "NotFinalized",
      "msg": "Quiz has not been finalized yet"
    },
    {
      "code": 6003,
      "name": "AlreadyClaimed",
      "msg": "Prize has already been claimed"
    },
    {
      "code": 6004,
      "name": "ClaimExpired",
      "msg": "Claim period has expired"
    },
    {
      "code": 6005,
      "name": "QuizCancelled",
      "msg": "Quiz has been cancelled"
    },
    {
      "code": 6006,
      "name": "ClaimNotExpired",
      "msg": "Claim has not expired yet"
    },
    {
      "code": 6007,
      "name": "InsufficientEscrow",
      "msg": "Insufficient escrow balance"
    },
    {
      "code": 6008,
      "name": "PlatformNotAuthorized",
      "msg": "Platform authority not authorized for this quiz"
    },
    {
      "code": 6009,
      "name": "AlreadyAuthorized",
      "msg": "Platform authority already set for this quiz"
    },
    {
      "code": 6010,
      "name": "InvalidMint",
      "msg": "Invalid token mint"
    }
  ],
  "types": [
    {
      "name": "ClaimAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "quiz_id",
            "type": "string"
          },
          {
            "name": "claim_token",
            "type": "string"
          },
          {
            "name": "winner_email_hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "rank",
            "type": "u8"
          },
          {
            "name": "is_claimed",
            "type": "bool"
          },
          {
            "name": "claimed_at",
            "type": "i64"
          },
          {
            "name": "claimer_pubkey",
            "type": "pubkey"
          },
          {
            "name": "expires_at",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "QuizAccountShape",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "quiz_id",
            "type": "string"
          },
          {
            "name": "prize",
            "type": "u64"
          },
          {
            "name": "host_pub_key",
            "type": "pubkey"
          },
          {
            "name": "host_id",
            "type": "string"
          },
          {
            "name": "is_finalized",
            "type": "bool"
          },
          {
            "name": "total_winners",
            "type": "u8"
          },
          {
            "name": "total_claimed",
            "type": "u8"
          },
          {
            "name": "total_refunded",
            "type": "u64"
          },
          {
            "name": "is_cancelled",
            "type": "bool"
          },
          {
            "name": "claim_expiry",
            "type": "i64"
          },
          {
            "name": "platform_authority",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "escrow_bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
} as const;
