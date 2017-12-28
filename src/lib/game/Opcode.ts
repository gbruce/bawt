class GameOpcode {
  public static MSG_NULL_ACTION                    = 0x000;
  public static CMSG_BOOTME                        = 0x001;
  public static CMSG_DBLOOKUP                      = 0x002;
  public static SMSG_DBLOOKUP                      = 0x003;
  public static CMSG_QUERY_OBJECT_POSITION         = 0x004;
  public static SMSG_QUERY_OBJECT_POSITION                      = 0x005;
  public static CMSG_QUERY_OBJECT_ROTATION                      = 0x006;
  public static SMSG_QUERY_OBJECT_ROTATION                      = 0x007;
  public static CMSG_WORLD_TELEPORT                             = 0x008;
  public static CMSG_TELEPORT_TO_UNIT                           = 0x009;
  public static CMSG_ZONE_MAP                                   = 0x00A;
  public static SMSG_ZONE_MAP                                   = 0x00B;
  public static CMSG_DEBUG_CHANGECELLZONE                       = 0x00C;
  public static CMSG_MOVE_CHARACTER_CHEAT                       = 0x00D;
  public static SMSG_MOVE_CHARACTER_CHEAT                       = 0x00E;
  public static CMSG_RECHARGE                                   = 0x00F;
  public static CMSG_LEARN_SPELL                                = 0x010;
  public static CMSG_CREATEMONSTER                              = 0x011;
  public static CMSG_DESTROYMONSTER                             = 0x012;
  public static CMSG_CREATEITEM                                 = 0x013;
  public static CMSG_CREATEGAMEOBJECT                           = 0x014;
  public static SMSG_CHECK_FOR_BOTS                             = 0x015;
  public static CMSG_MAKEMONSTERATTACKGUID                      = 0x016;
  public static CMSG_BOT_DETECTED2                              = 0x017;
  public static CMSG_FORCEACTION                                = 0x018;
  public static CMSG_FORCEACTIONONOTHER                         = 0x019;
  public static CMSG_FORCEACTIONSHOW                            = 0x01A;
  public static SMSG_FORCEACTIONSHOW                            = 0x01B;
  public static CMSG_PETGODMODE                                 = 0x01C;
  public static SMSG_PETGODMODE                                 = 0x01D;
  public static SMSG_REFER_A_FRIEND_EXPIRED                     = 0x01E;
  public static CMSG_WEATHER_SPEED_CHEAT                        = 0x01F;
  public static CMSG_UNDRESSPLAYER                              = 0x020;
  public static CMSG_BEASTMASTER                                = 0x021;
  public static CMSG_GODMODE                                    = 0x022;
  public static SMSG_GODMODE                                    = 0x023;
  public static CMSG_CHEAT_SETMONEY                             = 0x024;
  public static CMSG_LEVEL_CHEAT                                = 0x025;
  public static CMSG_PET_LEVEL_CHEAT                            = 0x026;
  public static CMSG_SET_WORLDSTATE                             = 0x027;
  public static CMSG_COOLDOWN_CHEAT                             = 0x028;
  public static CMSG_USE_SKILL_CHEAT                            = 0x029;
  public static CMSG_FLAG_QUEST                                 = 0x02A;
  public static CMSG_FLAG_QUEST_FINISH                          = 0x02B;
  public static CMSG_CLEAR_QUEST                                = 0x02C;
  public static CMSG_SEND_EVENT                                 = 0x02D;
  public static CMSG_DEBUG_AISTATE                              = 0x02E;
  public static SMSG_DEBUG_AISTATE                              = 0x02F;
  public static CMSG_DISABLE_PVP_CHEAT                          = 0x030;
  public static CMSG_ADVANCE_SPAWN_TIME                         = 0x031;
  public static SMSG_DESTRUCTIBLE_BUILDING_DAMAGE               = 0x032;
  public static CMSG_AUTH_SRP6_BEGIN                            = 0x033;
  public static CMSG_AUTH_SRP6_PROOF                            = 0x034;
  public static CMSG_AUTH_SRP6_RECODE                           = 0x035;
  public static CMSG_CHAR_CREATE                                = 0x036;
  public static CMSG_CHAR_ENUM                     = 0x0037;
  public static SMSG_CHAR_ENUM                     = 0x003B;
  public static CMSG_PLAYER_LOGIN                  = 0x003D;
  public static SMSG_CHARACTER_LOGIN_FAILED        = 0x0041;
  public static SMSG_LOGIN_SETTIMESPEED            = 0x0042;
  public static SMSG_CONTACT_LIST                  = 0x0067;
  public static CMSG_MESSAGE_CHAT                  = 0x0095;
  public static SMSG_MESSAGE_CHAT                  = 0x0096;
  public static SMSG_UPDATE_OBJECT                 = 0x00A9;
  public static SMSG_MONSTER_MOVE                  = 0x00DD;
  public static SMSG_TUTORIAL_FLAGS                = 0x00FD;
  public static SMSG_INITIALIZE_FACTIONS           = 0x0122;
  public static SMSG_SET_PROFICIENCY               = 0x0127;
  public static SMSG_ACTION_BUTTONS                = 0x0129;
  public static SMSG_INITIAL_SPELLS                = 0x012A;
  public static SMSG_SPELL_START                   = 0x0131;
  public static SMSG_SPELL_GO                      = 0x0132;
  public static SMSG_BINDPOINT_UPDATE              = 0x0155;
  public static SMSG_ITEM_TIME_UPDATE              = 0x01EA;
  public static SMSG_AUTH_CHALLENGE                = 0x01EC;
  public static CMSG_AUTH_PROOF                    = 0x01ED;
  public static SMSG_AUTH_RESPONSE                 = 0x01EE;
  public static SMSG_COMPRESSED_UPDATE_OBJECT      = 0x01F6;
  public static SMSG_ACCOUNT_DATA_TIMES            = 0x0209;
  public static SMSG_LOGIN_VERIFY_WORLD            = 0x0236;
  public static SMSG_SPELL_NON_MELEE_DAMAGE_LOG    = 0x0250;
  public static SMSG_INIT_WORLD_STATES             = 0x02C2;
  public static SMSG_UPDATE_WORLD_STATE            = 0x02C3;
  public static SMSG_WARDEN_DATA                   = 0x02E6;
  public static SMSG_ADDON_INFO                    = 0x02EF;
  public static SMSG_WEATHER                       = 0x02F4;
  public static MSG_SET_DUNGEON_DIFFICULTY         = 0x0329;
  public static SMSG_UPDATE_INSTANCE_OWNERSHIP     = 0x032B;
  public static SMSG_INSTANCE_DIFFICULTY           = 0x033B;
  public static SMSG_MOTD                          = 0x033D;
  public static SMSG_TIME_SYNC_REQ                 = 0x0390;
  public static SMSG_FEATURE_SYSTEM_STATUS         = 0x03C9;
  public static SMSG_CLIENTCACHE_VERSION           = 0x04AB;
  public static SMSG_SERVER_BUCK_DATA              = 0x041D;
  public static SMSG_SEND_UNLEARN_SPELLS           = 0x041E;
  public static SMSG_LEARNED_DANCE_MOVES           = 0x0455;
  public static SMSG_ALL_ACHIEVEMENT_DATA          = 0x047D;
  public static SMSG_POWER_UPDATE                  = 0x0480;
  public static SMSG_AURA_UPDATE_ALL               = 0x0495;
  public static SMSG_AURA_UPDATE                   = 0x0496;
  public static SMSG_EQUIPMENT_SET_LIST            = 0x04BC;
  public static SMSG_TALENTS_INFO                  = 0x04C0;
  public static MSG_SET_RAID_DIFFICULTY            = 0x04EB;
}

export default GameOpcode;
