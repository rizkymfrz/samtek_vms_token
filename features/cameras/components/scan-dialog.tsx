"use client";
import {
  CctvIcon,
  CheckCircle2Icon,
  FactoryIcon,
  GlobeIcon,
  KeyRoundIcon,
  PlusIcon,
  ScanSearchIcon,
  ServerIcon,
} from "lucide-react";
import { useId, useState } from "react";
import { Pick } from "@/components/shared/pick";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogDivider,
  DialogFooter,
  DialogHeader,
  DialogSection,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SCAN_LOGINS } from "@/config/scan";
import { useDeviceScan } from "../hooks/use-device-scan";
import {
  DEFAULT_PORTS,
  defaultRange,
  draftFromResult,
  parseScanForm,
  resultKey,
  resultTitle,
  type ScanCredential,
  sortResults,
  streamCount,
  streamSets,
} from "../lib/device-scan";
import type { Draft } from "../lib/edit-camera";
import type { ServerOption } from "../types";

const PHASE_TEXT = {
  idle: "",
  starting: "Starting the scan…",
  running: "Scanning…",
  completed: "Scan finished.",
  cancelled: "Scan stopped.",
  failed: "Scan failed.",
} as const;

export const ScanDialog = ({
  isOpen,
  servers,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  servers: ServerOption[];
  onClose: () => void;
  onAdd: (draft: Draft) => void;
}) => {
  const formId = useId();
  const { session, start, stop, isScanning } = useDeviceScan();
  const [serverId, setServerId] = useState(
    () => (servers.find((s) => s.online) ?? servers[0])?.id ?? "",
  );
  const [editedRange, setEditedRange] = useState<string | null>(null);
  const [ports, setPorts] = useState(DEFAULT_PORTS);
  const [formError, setFormError] = useState<string | null>(null);
  const [used, setUsed] = useState<{
    serverId: string;
    credentials: ScanCredential[];
  }>({ serverId: "", credentials: [] });
  const ipRange =
    editedRange ??
    defaultRange(servers.find((s) => s.id === serverId)?.hostAddress ?? null);
  const serverItems = servers.map((s) => ({
    value: s.id,
    label: s.online ? s.name : `${s.name} (offline)`,
  }));
  const results = sortResults(session.results);
  const { scanned, total_hosts: total, found } = session.progress;
  const submit = () => {
    const form = parseScanForm(ipRange, ports, SCAN_LOGINS);
    if (!serverId) {
      setFormError("Edge server is required.");
      return;
    }
    if (!form.ok) {
      setFormError(form.message);
      return;
    }
    setFormError(null);
    setUsed({ serverId, credentials: form.credentials });
    void start(serverId, form.ipRange, form.ports, form.credentials);
  };
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="xl">
        <DialogHeader icon={ScanSearchIcon}>
          <DialogTitle>Scan for cameras</DialogTitle>
          <DialogDescription>
            The edge server looks for ONVIF cameras on its own network.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <DialogBody>
          <DialogSection>
            <form
              id={formId}
              noValidate
              className="contents"
              onSubmit={(event) => {
                event.preventDefault();
                submit();
              }}
            >
              <Field>
                <FieldLabel>Edge server</FieldLabel>
                <Pick
                  label="Edge server"
                  icon={ServerIcon}
                  items={serverItems}
                  value={serverId}
                  onChange={setServerId}
                  className="w-full"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${formId}-range`}>IP range</FieldLabel>
                <Input
                  id={`${formId}-range`}
                  value={ipRange}
                  onChange={(event) => setEditedRange(event.target.value)}
                  placeholder="e.g. 192.168.1.0/24"
                  disabled={isScanning}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${formId}-ports`}>Ports</FieldLabel>
                <Input
                  id={`${formId}-ports`}
                  value={ports}
                  onChange={(event) => setPorts(event.target.value)}
                  disabled={isScanning}
                />
              </Field>
              {(formError || session.error) && (
                <FieldError>{formError ?? session.error}</FieldError>
              )}
            </form>
          </DialogSection>
          <DialogDivider />
          <DialogSection>
            <p className="text-xs text-muted-foreground tabular-nums">
              {PHASE_TEXT[session.phase]}
              {session.phase !== "idle" &&
                total > 0 &&
                ` ${scanned}/${total} hosts · ${found} found`}
            </p>
            {results.length === 0 ? (
              session.phase !== "idle" &&
              !isScanning && (
                <p className="text-xs text-muted-foreground">
                  No ONVIF cameras were found.
                </p>
              )
            ) : (
              <div className="flex max-h-80 flex-col overflow-hidden rounded border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead icon={GlobeIcon}>Address</TableHead>
                      <TableHead icon={FactoryIcon}>Device</TableHead>
                      <TableHead icon={KeyRoundIcon}>Login</TableHead>
                      <TableHead icon={CctvIcon} className="text-right">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.flatMap((result) =>
                      streamSets(result).map((set) => (
                        <TableRow key={`${resultKey(result)}/${set.key}`}>
                          <TableCell className="tabular-nums">
                            {result.host}:{result.port}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>
                                {resultTitle(result)}
                                {set.label && ` · ${set.label}`}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {streamCount(set)} streams
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {result.credential_id ? (
                              <span className="inline-flex items-center gap-1 text-xs">
                                <CheckCircle2Icon className="size-3" />
                                Matched
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                None
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              onClick={() =>
                                onAdd(
                                  draftFromResult(
                                    result,
                                    set,
                                    used.credentials,
                                    servers,
                                    used.serverId,
                                  ),
                                )
                              }
                            >
                              <PlusIcon />
                              Add
                            </Button>
                          </TableCell>
                        </TableRow>
                      )),
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </DialogSection>
        </DialogBody>
        <Separator />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          {isScanning ? (
            <Button type="button" variant="secondary" onClick={stop}>
              Stop scan
            </Button>
          ) : (
            <Button type="submit" form={formId}>
              {session.phase === "idle" ? "Start scan" : "Scan again"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
