export interface IUser {
  id: string;
  username: string;
  password: string;
  role: "user" | "admin";
  status: "active" | "inactive";
  created_at: string;
}

export interface IMachine {
  nom_machine: string;
  numero: number;
  img_machine: string;
  designation_complete: string;
}

export interface IPdr {
  code: number;
  numero: number;
  designation_pdr: string;
  valeur: number;
  emplacement: string;
  stock_actuel: number;
  machine: string;
  reference: string;
  images_Pdr: string[];
}
