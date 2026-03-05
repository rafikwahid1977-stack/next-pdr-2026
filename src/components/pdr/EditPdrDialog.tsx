"use client";

import React, { useState } from "react";
import { IPdr } from "@/interfaces";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { editPdr } from "@/actions/pdrs";
import toast from "react-hot-toast";

interface EditPdrDialogProps {
  pdr: IPdr | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditPdrDialog({
  pdr,
  isOpen,
  onOpenChange,
  onSuccess,
}: EditPdrDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      numero: pdr?.numero || 0,
      designation_pdr: pdr?.designation_pdr || "",
      valeur: pdr?.valeur || 0,
      emplacement: pdr?.emplacement || "",
      stock_actuel: pdr?.stock_actuel || 0,
      reference: pdr?.reference || "",
    },
  });

  React.useEffect(() => {
    if (pdr) {
      form.reset({
        numero: pdr.numero,
        designation_pdr: pdr.designation_pdr,
        valeur: pdr.valeur,
        emplacement: pdr.emplacement,
        stock_actuel: pdr.stock_actuel,
        reference: pdr.reference,
      });
    }
  }, [pdr, form]);

  const onSubmit = async (data: any) => {
    if (!pdr) return;

    setIsLoading(true);
    try {
      const result = await editPdr(pdr.code, data);

      if (result.success) {
        toast.success("PDR mis à jour avec succès");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error("Erreur lors de la mise à jour du PDR");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le PDR</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations du PDR
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="numero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Numéro"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="designation_pdr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Désignation</FormLabel>
                  <FormControl>
                    <Input placeholder="Désignation PDR" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valeur"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valeur</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Valeur"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emplacement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emplacement</FormLabel>
                  <FormControl>
                    <Input placeholder="Emplacement" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stock_actuel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Actuel</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Stock Actuel"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Référence</FormLabel>
                  <FormControl>
                    <Input placeholder="Référence" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Mise à jour..." : "Mettre à jour"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
