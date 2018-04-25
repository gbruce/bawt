import * as Long from 'long';

export interface ICharacter {
  readonly Guid: Long;
  readonly Name: string;
  readonly Race: number;
  readonly Class: number;
  readonly Gender: number;
  readonly Skin: number;
  readonly Face: number;
  readonly HairStyle: number;
  readonly HairColor: number;
  readonly Facial: number;
  readonly Level: number;
  readonly Zone: number;
  readonly Map: number;
  readonly X: number;
  readonly Y: number;
  readonly Z: number;
  readonly GuildId: number;
  readonly CharacterFlags: number;
  readonly FirstLogin: number;
  readonly PetDisplayId: number;
  readonly PetLevel: number;
  readonly PetFamily: number;
  // TODO: Add equipment
  // readonly Equipment: EquipmentSlot[] = [];
  readonly FirstBadDisplayId: number;
  readonly FirstBagInventoryType: number;
}
