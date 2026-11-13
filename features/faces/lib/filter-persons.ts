import type { FaceRecord, Person } from "../types";

export const ALL = "all";

export type Filters = {
  query: string;
  group: string;
  edge: string;
};

export const DEFAULT_FILTERS: Filters = { query: "", group: ALL, edge: ALL };

export const isFiltered = (filters: Filters) =>
  filters.query.trim() !== "" || filters.group !== ALL || filters.edge !== ALL;

export const groupPersons = (faces: FaceRecord[]): Person[] => {
  const persons = new Map<string, Person>();
  for (const face of faces) {
    const key = `${face.edgeId}:${face.personId}`;
    const person = persons.get(key);
    if (person) {
      person.faceIds.push(face.id);
      if (face.hasPhoto) person.photoIds.push(face.id);
    } else {
      persons.set(key, {
        key,
        personId: face.personId,
        name: face.name,
        group: face.group,
        edgeId: face.edgeId,
        edgeName: face.edgeName,
        faceIds: [face.id],
        photoIds: face.hasPhoto ? [face.id] : [],
      });
    }
  }
  return [...persons.values()].sort((a, b) => a.name.localeCompare(b.name));
};

export const filterPersons = (persons: Person[], filters: Filters) => {
  const needle = filters.query.trim().toLowerCase();
  return persons.filter(
    (person) =>
      (filters.group === ALL || person.group === filters.group) &&
      (filters.edge === ALL || person.edgeId === filters.edge) &&
      (!needle ||
        `${person.name} ${person.personId}`.toLowerCase().includes(needle)),
  );
};

export const countByGroup = (persons: Person[], filters: Filters) => {
  const counts = new Map<string, number>();
  for (const person of filterPersons(persons, { ...filters, group: ALL })) {
    counts.set(person.group, (counts.get(person.group) ?? 0) + 1);
  }
  return [...counts]
    .map(([group, count]) => ({ group, count }))
    .sort((a, b) => a.group.localeCompare(b.group));
};
