// components/credential-table.tsx

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyIcon, CheckIcon, Loader2 } from "lucide-react";
import { useState } from "react";

export function CredentialTable({ credentials, onSend }) {
  const [copiedId, setCopiedId] = useState(null);
  const [sendingId, setSendingId] = useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (id) => {
    setSendingId(id);

    try {
      await onSend(id);
    } catch (error) {
      console.error("Error sending credentials:", error);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Recipient Email</TableHead>
          <TableHead>Key</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {credentials.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              No credentials found.
            </TableCell>
          </TableRow>
        ) : (
          credentials.map((cred) => (
            <TableRow key={cred.id}>
              <TableCell>{cred.recipientEmail}</TableCell>
              <TableCell className="flex items-center">
                {cred.key}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 ml-2"
                  onClick={() => handleCopy(cred.key, `key-${cred.id}`)}
                >
                  {copiedId === `key-${cred.id}` ? (
                    <CheckIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
              <TableCell className="flex items-center">
                {cred.value}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 ml-2"
                  onClick={() => handleCopy(cred.value, `value-${cred.id}`)}
                >
                  {copiedId === `value-${cred.id}` ? (
                    <CheckIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
              <TableCell>
                {cred.lastSent ? (
                  <div className="flex flex-col">
                    <Badge variant="outline" className="mb-1">
                      Sent
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(cred.lastSent).toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <Badge variant="outline" className="bg-yellow-100">
                    Not Sent
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant={cred.lastSent ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleSend(cred.id)}
                  disabled={sendingId === cred.id} // Disable when this specific button is loading
                >
                  {sendingId === cred.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : cred.lastSent ? (
                    "Resend"
                  ) : (
                    "Send"
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
