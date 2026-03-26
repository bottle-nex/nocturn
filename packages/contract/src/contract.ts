/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/contract.json`.
 */
export type Contract = {
  "address": "3ULNo29njjmDEyLr8DSyyJUDgnZW5BqPGrHFXVP2fjKL",
  "metadata": {
    "name": "contract",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "authorizePlatform",
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
          "name": "quizAccount",
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
                "path": "quizId"
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
          "name": "quizId",
          "type": "string"
        },
        {
          "name": "platformPubkey",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "cancelQuiz",
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
          "name": "quizAccount",
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
                "path": "quizId"
              },
              {
                "kind": "account",
                "path": "host"
              }
            ]
          }
        },
        {
          "name": "escrowAccount",
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
                "path": "quizAccount"
              }
            ]
          }
        },
        {
          "name": "host",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "quizId",
          "type": "string"
        }
      ]
    },
    {
      "name": "claimPrize",
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
          "name": "quizAccount",
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
                "path": "quizId"
              },
              {
                "kind": "account",
                "path": "quiz_account.host_pub_key",
                "account": "quizAccountShape"
              }
            ]
          }
        },
        {
          "name": "escrowAccount",
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
                "path": "quizAccount"
              }
            ]
          }
        },
        {
          "name": "claimAccount",
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
                "path": "quizId"
              },
              {
                "kind": "arg",
                "path": "claimToken"
              }
            ]
          }
        },
        {
          "name": "claimer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "quizId",
          "type": "string"
        },
        {
          "name": "claimToken",
          "type": "string"
        }
      ]
    },
    {
      "name": "createQuiz",
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
          "name": "quizAccount",
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
                "path": "quizId"
              },
              {
                "kind": "account",
                "path": "host"
              }
            ]
          }
        },
        {
          "name": "escrowAccount",
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
                "path": "quizAccount"
              }
            ]
          }
        },
        {
          "name": "nocturnAccount",
          "writable": true,
          "address": "3ULNo29njjmDEyLr8DSyyJUDgnZW5BqPGrHFXVP2fjKL"
        },
        {
          "name": "host",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "quizId",
          "type": "string"
        },
        {
          "name": "hostId",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "finalizeQuiz",
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
          "name": "quizAccount",
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
                "path": "quizId"
              },
              {
                "kind": "account",
                "path": "quiz_account.host_pub_key",
                "account": "quizAccountShape"
              }
            ]
          }
        },
        {
          "name": "claimAccount",
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
                "path": "quizId"
              },
              {
                "kind": "arg",
                "path": "claimToken"
              }
            ]
          }
        },
        {
          "name": "escrowAccount",
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
                "path": "quizAccount"
              }
            ]
          }
        },
        {
          "name": "platformAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "quizId",
          "type": "string"
        },
        {
          "name": "claimToken",
          "type": "string"
        },
        {
          "name": "winnerEmailHash",
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
          "name": "expiresAt",
          "type": "i64"
        }
      ]
    },
    {
      "name": "reclaimExpired",
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
          "name": "quizAccount",
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
                "path": "quizId"
              },
              {
                "kind": "account",
                "path": "host"
              }
            ]
          }
        },
        {
          "name": "escrowAccount",
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
                "path": "quizAccount"
              }
            ]
          }
        },
        {
          "name": "claimAccount",
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
                "path": "quizId"
              },
              {
                "kind": "arg",
                "path": "claimToken"
              }
            ]
          }
        },
        {
          "name": "host",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "quizId",
          "type": "string"
        },
        {
          "name": "claimToken",
          "type": "string"
        }
      ]
    },
    {
      "name": "sealQuiz",
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
          "name": "quizAccount",
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
                "path": "quizId"
              },
              {
                "kind": "account",
                "path": "quiz_account.host_pub_key",
                "account": "quizAccountShape"
              }
            ]
          }
        },
        {
          "name": "platformAuthority",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "quizId",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "claimAccount",
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
      "name": "quizAccountShape",
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
      "name": "unauthorized",
      "msg": "Only the property owner can perform this action"
    },
    {
      "code": 6001,
      "name": "alreadyFinalized",
      "msg": "Quiz has already been finalized"
    },
    {
      "code": 6002,
      "name": "notFinalized",
      "msg": "Quiz has not been finalized yet"
    },
    {
      "code": 6003,
      "name": "alreadyClaimed",
      "msg": "Prize has already been claimed"
    },
    {
      "code": 6004,
      "name": "claimExpired",
      "msg": "Claim period has expired"
    },
    {
      "code": 6005,
      "name": "quizCancelled",
      "msg": "Quiz has been cancelled"
    },
    {
      "code": 6006,
      "name": "claimNotExpired",
      "msg": "Claim has not expired yet"
    },
    {
      "code": 6007,
      "name": "insufficientEscrow",
      "msg": "Insufficient escrow balance"
    },
    {
      "code": 6008,
      "name": "platformNotAuthorized",
      "msg": "Platform authority not authorized for this quiz"
    },
    {
      "code": 6009,
      "name": "alreadyAuthorized",
      "msg": "Platform authority already set for this quiz"
    }
  ],
  "types": [
    {
      "name": "claimAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "quizId",
            "type": "string"
          },
          {
            "name": "claimToken",
            "type": "string"
          },
          {
            "name": "winnerEmailHash",
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
            "name": "isClaimed",
            "type": "bool"
          },
          {
            "name": "claimedAt",
            "type": "i64"
          },
          {
            "name": "claimerPubkey",
            "type": "pubkey"
          },
          {
            "name": "expiresAt",
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
      "name": "quizAccountShape",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "quizId",
            "type": "string"
          },
          {
            "name": "prize",
            "type": "u64"
          },
          {
            "name": "hostPubKey",
            "type": "pubkey"
          },
          {
            "name": "hostId",
            "type": "string"
          },
          {
            "name": "isFinalized",
            "type": "bool"
          },
          {
            "name": "totalWinners",
            "type": "u8"
          },
          {
            "name": "totalClaimed",
            "type": "u8"
          },
          {
            "name": "totalRefunded",
            "type": "u64"
          },
          {
            "name": "isCancelled",
            "type": "bool"
          },
          {
            "name": "claimExpiry",
            "type": "i64"
          },
          {
            "name": "platformAuthority",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
