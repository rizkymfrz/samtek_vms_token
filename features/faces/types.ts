export type FaceRecord = {
  id: string;
  personId: string;
  name: string;
  group: string;
  hasPhoto: boolean;
  edgeId: string;
  edgeName: string;
};

export type EdgeOption = { id: string; name: string };
export type FaceFailure = { edgeName: string; message: string };

export type FacesData = {
  faces: FaceRecord[];
  edges: EdgeOption[];
  failures: FaceFailure[];
};

export type Person = {
  key: string;
  personId: string;
  name: string;
  group: string;
  edgeId: string;
  edgeName: string;
  faceIds: string[];
  photoIds: string[];
};
