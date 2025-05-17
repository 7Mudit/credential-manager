// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CredentialTable } from "@/components/credential-table";
import { AddCredentialDialog } from "@/components/add-credential-dialog";
import { toast, Toaster } from "sonner";

export default function Home() {
  const [credentials, setCredentials] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Load credentials on page load
  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    const response = await fetch("/api/credentials");
    const data = await response.json();
    setCredentials(data);
  };

  const handleAddCredential = async (credData) => {
    const response = await fetch("/api/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credData),
    });

    const data = await response.json();

    if (data.status === "success") {
      fetchCredentials();
      toast.success("Credentials Added", {
        description: `New credential pair has been added successfully.`,
      });
      setIsAddDialogOpen(false);
    } else {
      toast.error(data.message);
    }
  };

  const handleSendCredential = async (credId) => {
    const response = await fetch(`/api/send/${credId}`, {
      method: "POST",
    });

    const data = await response.json();

    if (data.status === "success") {
      fetchCredentials();
      toast.success("Credentials Sent", {
        description: `Credentials have been sent successfully.`,
      });
    } else {
      toast.error(data.message);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Credential Sender</CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            Add New Credential
          </Button>
        </CardHeader>
        <CardContent>
          <CredentialTable
            credentials={credentials}
            onSend={handleSendCredential}
          />
        </CardContent>
      </Card>

      <AddCredentialDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddCredential}
      />

      <Toaster />
    </div>
  );
}
