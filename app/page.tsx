// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CredentialTable } from "@/components/credential-table";
import { AddCredentialDialog } from "@/components/add-credential-dialog";
import { toast, Toaster } from "sonner";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [credentials, setCredentials] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load credentials on page load
  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/credentials");

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      setCredentials(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching credentials:", error);
      toast.error("Failed to fetch credentials", {
        description: "Please try refreshing the page.",
      });
      setCredentials([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCredential = async (credData) => {
    try {
      const response = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        fetchCredentials();
        toast.success("Credentials Added", {
          description: `New credential pair has been added successfully.`,
        });
        setIsAddDialogOpen(false);
      } else {
        throw new Error(data.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error adding credential:", error);
      toast.error("Failed to add credential", {
        description: error.message || "Please try again.",
      });
    }
  };

  const handleSendCredential = async (credId) => {
    try {
      const response = await fetch(`/api/send/${credId}`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        fetchCredentials();
        toast.success("Credentials Sent", {
          description: `Credentials have been sent successfully.`,
        });
      } else {
        throw new Error(data.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error sending credential:", error);
      toast.error("Failed to send credentials", {
        description: error.message || "Please try again.",
      });
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
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <span>Loading credentials...</span>
            </div>
          ) : (
            <CredentialTable
              credentials={credentials}
              onSend={handleSendCredential}
            />
          )}
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
