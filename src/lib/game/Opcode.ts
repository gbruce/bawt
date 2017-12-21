class GameOpcode {

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

  public static SMSG_WEATHER                       = 0x02F4;

  public static MSG_SET_DUNGEON_DIFFICULTY         = 0x0329;

  public static SMSG_UPDATE_INSTANCE_OWNERSHIP     = 0x032B;

  public static SMSG_INSTANCE_DIFFICULTY           = 0x033B;

  public static SMSG_MOTD                          = 0x033D;

  public static SMSG_TIME_SYNC_REQ                 = 0x0390;

  public static SMSG_FEATURE_SYSTEM_STATUS         = 0x03C9;

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
