export interface WishItem {
  name: string;
  rarity: number;
  type: string;
  vision?: string;
  weaponType?: string;
  outfitName?: string;
  stelaFortuna?: boolean;
  isNew?: boolean;
  bonusType?: string;
  bonusQty?: number;
  useOutfit?: boolean;
  offset?: {
    wishCard?: any;
    splashArt?: any;
  };
  custom?: boolean;
}
