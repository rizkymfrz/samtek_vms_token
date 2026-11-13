import {
  EllipsisIcon,
  ServerIcon,
  TagIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react";
import { Thumbnail } from "@/components/shared/thumbnail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Person } from "../types";

export const PersonTable = ({
  persons,
  onDelete,
}: {
  persons: Person[];
  onDelete: (person: Person) => void;
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead icon={UserIcon}>Person</TableHead>
          <TableHead icon={TagIcon}>Group</TableHead>
          <TableHead icon={ServerIcon}>Edge server</TableHead>
          <TableHead icon={EllipsisIcon} className="text-right">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {persons.map((person) => (
          <TableRow key={person.key}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Thumbnail
                  src={
                    person.photoIds[0]
                      ? `/api/edge/${person.edgeId}/faces/${person.photoIds[0]}/photo`
                      : null
                  }
                  label={`Photo of ${person.name}`}
                  icon={UserIcon}
                  className="size-10"
                  imageClassName="object-top"
                />
                <span className="font-medium">{person.name}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{person.group}</Badge>
            </TableCell>
            <TableCell>{person.edgeName}</TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="destructive"
                  size="icon"
                  aria-label={`Delete ${person.name}`}
                  title="Delete"
                  onClick={() => onDelete(person)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
