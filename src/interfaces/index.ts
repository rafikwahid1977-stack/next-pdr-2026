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

export interface IElectro {
  id: string;
  observation: "ras" | "intervention";
  code_intervention: string;
  machine: string;
  partie_machine: string;
  intervention: string;
  photos_intervention: string[];
  pieces: {
    designation: string;
    reference: string;
    code: number;
    quantite: number;
    img_piece: string;
  }[];
  created_at: string;
}

export interface IMecano {
  id: string;
  code_intervention: string;
  machine: string;
  partie_machine: string;
  description: string;
  imgs_intervention: string[];
  pieces: {
    designation: string;
    reference: string;
    code: number;
    quantite: number;
    img_piece: string;
  }[];
  user: string;
  created_at: string;
}
