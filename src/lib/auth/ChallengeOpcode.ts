class ChallengeOpcode {

  public static SUCCESS            = 0x00;
  public static UNKNOWN0           = 0x01;
  public static UNKNOWN1           = 0x02;
  public static ACCOUNT_BANNED     = 0x03;
  public static ACCOUNT_INVALID    = 0x04;
  public static PASSWORD_INVALID   = 0x05;
  public static ALREADY_ONLINE     = 0x06;
  public static OUT_OF_CREDIT      = 0x07;
  public static BUSY               = 0x08;
  public static BUILD_INVALID      = 0x09;
  public static BUILD_UPDATE       = 0x0A;
  public static INVALID_SERVER     = 0x0B;
  public static ACCOUNT_SUSPENDED  = 0x0C;
  public static ACCESS_DENIED      = 0x0D;
  public static SURVEY             = 0x0E;
  public static PARENTAL_CONTROL   = 0x0F;
  public static LOCK_ENFORCED      = 0x10;
  public static TRIAL_EXPIRED      = 0x11;
  public static BATTLE_NET         = 0x12;

}

export default ChallengeOpcode;
