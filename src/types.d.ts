export interface Env {}

export interface RecordSearchParameters {
  count: number;
  offset?: number;
  private?: boolean;
  byOwner?: string;
  ownerType?: OwnerType;
  submittedTo?: string;
  onlyFeatured?: boolean;
  recordType?: string;
  requiredTags?: string[];
  optionalTags?: string[];
  excludedTags?: string[];
  minDate?: Date | null;
  maxDate?: Date | null;
  sortBy: SearchSortParameter;
  sortDirection: SearchSortDirection;
}

export enum OwnerType {
  Machine,
  User,
  Group,
  INVALID,
}

export enum SearchSortParameter {
  CreationDate,
  LastUpdateDate,
  FirstPublishTime,
  TotalVisits,
  Name,
  Random,
}

export enum SearchSortDirection {
  Ascending,
  Descending,
}

export interface QuotaBytesSources {
  base: number;
  patreon: number;
}

export interface Records {
  records: Record[];
}

export interface Record {
  id: string;
  ownerId: string;
  assetURI: string;
  version: RecordVersion;
  name: string;
  description?: string;
  recordType: string;
  ownerName: string;
  tags?: Set<string>;
  path: string;
  thumbnailUri?: string;
  lastModificationTime: Date;
  creationTime?: Date | null;
  firstPublishTime?: Date | null;
  isDeleted: boolean;
  isPublic: boolean;
  isForPatrons: boolean;
  isListed: boolean;
  visits: number;
  rating: number;
  randomOrder: number;
  submissions: Submission[];
  manifest: string[];
  assetManifest?: DBAsset[];
  migrationMetadata?: MigrationMetadata;
}

interface RecordVersion {
  globalVersion: number;
  localVersion: number;
  lastModifyingUserId?: string;
  lastModifyingMachineId?: string;
}

interface Submission {
  id: string;
  groupId: string;
  targetRecordId: RecordId;
  submissionTime: Date;
  submittedById: string;
  submittedByName: string;
  featured: boolean;
  featuredByUserId: string;
  featuredTimestamp?: Date | null;
}

interface RecordId {
  id: string;
  ownerId: string;
  isValid: boolean;
}

interface DBAsset {
  hash: string;
  bytes: number;
}
interface MigrationMetadata {
  migrationId: string;
  migrationSource: string;
  migratedOn: Date;
  sourceVersion: RecordVersion;
  targetVersion?: RecordVersion | null;
  assetManifest?: DBAsset[];
  previousMigration: MigrationMetadata;
}
