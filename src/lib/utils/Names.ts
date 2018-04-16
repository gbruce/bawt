import { injectable } from 'inversify';
import { IRealm } from 'interface/IRealm';
import { ICharacter } from 'interface/ICharacter';

@injectable()
export class Names {
  private static readonly RealmTypePvp = '(PVP)';
  private static readonly RealmTypeNormal = 'Normal';
  RealmTypeToString(realm: IRealm): string {
    switch(realm.Type) {
      case 1: return Names.RealmTypePvp;
      default: return Names.RealmTypeNormal;
    }
  }

  private static readonly RealmPopulationLow = 'Low';
  private static readonly RealmPopulationMedium = 'Medium';
  private static readonly RealmPopulationHight = 'High';
  RealmPopulationToString(realm: IRealm): string {
    if(realm.Population > 1.97) {
      return 'High';
    }

    if(realm.Population > 1.80) {
      return 'Medium';
    }

    return 'Low';
  }

  private static readonly CharacterClassWarrior = 'Warrior';
  private static readonly CharacterClassPriest = 'Priest';
  private static readonly CharacterClassDruid = 'Drood';
  private static readonly CharacterClassShaman = 'Shammy';
  private static readonly CharacterClassRogue = 'Rouge';
  private static readonly CharacterClassPaladin = 'Pally';
  private static readonly CharacterClassMage = 'Mage';
  private static readonly CharacterClassHunter = 'Hunter';
  CharacterClassToString(character: ICharacter): string {
    switch(character.Class) {
      case 1: return Names.CharacterClassWarrior;
      case 2: return Names.CharacterClassPaladin;
      case 3: return Names.CharacterClassHunter;
      case 4: return Names.CharacterClassRogue;
      case 5: return Names.CharacterClassPriest;
      case 7: return Names.CharacterClassShaman;
      case 8: return Names.CharacterClassMage;
      case 11: return Names.CharacterClassDruid;
    }
    return `Unknown (${character.Class})`;
  }

  private static readonly CharacterRaceHuman = 'Human';
  private static readonly CharacterRaceNightElf = 'Nelf';
  private static readonly CharacterRaceGnome = 'Gnome';
  private static readonly CharacterRaceDwrf = 'Dwarf';
  private static readonly CharacterRaceOrc = 'Orc';
  private static readonly CharacterRaceTauren = 'Tauren';
  private static readonly CharacterRaceUndead = 'Undead';
  CharacterRaceToString(character: ICharacter): string {
    switch(character.Race) {
      case 1: return Names.CharacterRaceHuman;
      case 2: return Names.CharacterRaceOrc;
      case 3: return Names.CharacterRaceDwrf;
      case 4: return Names.CharacterRaceNightElf;
      case 5: return Names.CharacterRaceUndead;
      case 6: return Names.CharacterRaceTauren;
      case 7: return Names.CharacterRaceGnome;
    }
    return `Unknown ${character.Race}`;
  }
}
