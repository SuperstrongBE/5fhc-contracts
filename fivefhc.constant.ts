export const CollectionName = 'fivefhcshits';
export const SchemaName = 'fivefhcshits';
export const SplitSharePercentKey = 'gsplitshare';
export const ShareIndexKey = 'gshareindex';
export const LoyaltyHWMKey = 'gloyaltyhwm';
export const AvailableTemplateDataKey = 'availtempl'
export const AvailablePresalesDataKey = 'availpresales'
export const MintKey = '5FHCMINT'
export const PresaleKey = '5FHCPRESALE'

export enum MemoPositionalIndex {

    MINTKEY,
    COLLECTION_NAME,
    RL_MULTIPLIER,
    ASSET_NAME,
    BIRTHDATE,
    IPFS,


}

export interface UnserializedMemo {

    mintKey: string;
    collectionName: string;
    rlMultiplier: number;

}



