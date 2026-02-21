"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Search } from "@/components/search";
import { Badge } from "@/components/ui/badge";
import { UserCircle } from "lucide-react";

export function AccountFeature() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const fields: { label: string; value: string | number }[] = [
    { label: "Account ID", value: user.accountId },
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Role ID", value: user.roleId },
  ];

  return (
    <>
      <Header>
        <div className="ms-auto flex items-center space-x-4">
          <Search />
        </div>
      </Header>

      <Main>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your personal account information.
          </p>
        </div>

        <Card className="max-w-lg">
          <CardHeader className="flex flex-row items-center gap-4 pb-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <UserCircle className="size-8 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="divide-y">
              {fields.map(({ label, value }) => (
                <div key={label} className="flex justify-between py-3 text-sm">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">
                    {label === "Account ID" || label === "Role ID" ? (
                      <Badge variant="secondary">{value}</Badge>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </Main>
    </>
  );
}
