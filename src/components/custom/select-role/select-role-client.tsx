"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { selectRole } from "@/actions/select-role/role.actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Loader2 } from "lucide-react";

interface SelectRoleClientProps {
  user: any;
}

const roles = [
  { id: "CUSTOMER", title: "Customer", description: "Order delicious food from local restaurants" },
  { id: "SELLER", title: "Seller", description: "Sell your food to customers" },
  { id: "RIDER", title: "Delivery Rider", description: "Deliver food to customers" },
];

export default function SelectRoleClient({ user }: SelectRoleClientProps) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleContinue = async () => {
    if (!selectedRole) return;

    try {
      setLoading(true);
      const res = await selectRole({ role: selectedRole, id: user.id });

      if (res.accessToken || res.message?.toLowerCase().includes("success")) {
        toast.success("Role selected successfully!");
        router.push("/");
      } else {
        toast.error(res.message || "Failed to assign role.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving your role.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center w-full min-h-screen bg-linear-to-br from-orange-50 via-red-50 to-yellow-50 dark:from-orange-950/30 dark:via-red-950/30 dark:to-yellow-950/30 p-4 font-sans">
      <Card className="w-full max-w-[460px] shadow-[0_20px_60px_-15px_rgba(234,88,12,0.2)] dark:shadow-none border-orange-100 dark:border-orange-900/50 rounded-[28px] animate-in fade-in zoom-in-95 duration-500 overflow-hidden bg-white dark:bg-zinc-950">

        <CardHeader className="space-y-2 pb-6 px-7 pt-8 text-center">
          <CardTitle className="text-[28px] leading-tight font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Select Your Role
          </CardTitle>
          <CardDescription className="text-[15px] leading-relaxed text-gray-600 dark:text-gray-400 font-medium">
            Choose how you will be using the platform to personalize your experience.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-7 pb-8">
          <RadioGroup
            value={selectedRole}
            onValueChange={setSelectedRole}
            className="space-y-4 mb-8"
          >
            {roles.map((r) => (
              <FieldLabel
                key={r.id}
                htmlFor={r.id}
                className={`flex w-full cursor-pointer p-0 m-0 border-2 rounded-2xl transition-all ${selectedRole === r.id
                    ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 shadow-md shadow-orange-500/10"
                    : "border-gray-200 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-900/50"
                  }`}
              >
                <Field orientation="horizontal" className="p-5 gap-4 w-full items-center">
                  <div className="pt-0.5 flex shrink-0">
                    <RadioGroupItem value={r.id} id={r.id} className="h-5 w-5" />
                  </div>
                  <FieldContent className="text-left w-full">
                    <FieldTitle className="text-[17px] font-bold text-gray-900 dark:text-gray-100">
                      {r.title}
                    </FieldTitle>
                    <FieldDescription className="text-[14px] text-gray-500 dark:text-gray-400 font-medium">
                      {r.description}
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>

          <Button
            onClick={handleContinue}
            disabled={!selectedRole || loading}
            className="w-full h-12 text-[16px] font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/25 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 dark:disabled:bg-zinc-800 disabled:text-gray-400 disabled:shadow-none text-white border-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}