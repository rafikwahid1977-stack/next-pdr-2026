"use server";

import supabaseConfig from "../../config/supabase-config";
import { IUser } from "@/interfaces";
import bcrypt from "bcryptjs";

export const registerUser = async (payload: Partial<IUser>) => {
  try {
    // Check if email already exists
    const { data: existingUser, error: fetchError } = await supabaseConfig
      .from("table_users")
      .select("username")
      .eq("username", payload.username)
      .single();

    if (existingUser) {
      throw new Error(
        "Username already registered. Please use a different username or login.",
      );
    }

    // hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(payload.password || "", salt);

    const { data, error } = await supabaseConfig.from("table_users").insert([
      {
        username: payload.username || null,
        password: hashedPassword || null,
        role: payload.role || "user",
        status: payload.status || "active",
      },
    ]);

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data: data,
      message: "User registred successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getOneUser = async (id: string) => {
  try {
    const { data, error } = await supabaseConfig
      .from("table_users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data: data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getAllUsers = async () => {
  try {
    const { data, error } = await supabaseConfig
      .from("table_users")
      .select("*");

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data: data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const deleteUser = async (id: string) => {
  try {
    const { error } = await supabaseConfig
      .from("table_users")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const updateUser = async (id: string, payload: Partial<IUser>) => {
  try {
    const updateData: any = {};

    if (payload.username) updateData.username = payload.username;
    if (payload.password) {
      const salt = bcrypt.genSaltSync(10);
      updateData.password = bcrypt.hashSync(payload.password, salt);
    }
    if (payload.role) updateData.role = payload.role;
    if (payload.status) updateData.status = payload.status;

    const { data, error } = await supabaseConfig
      .from("table_users")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data: data,
      message: "User updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const switchStatusUser = async (id: string) => {
  try {
    // Get current user status
    const { data: user, error: fetchError } = await supabaseConfig
      .from("table_users")
      .select("status")
      .eq("id", id)
      .single();

    if (fetchError || !user) {
      throw new Error("User not found");
    }

    // Switch status
    const newStatus = user.status === "active" ? "inactive" : "active";

    const { data, error } = await supabaseConfig
      .from("table_users")
      .update({ status: newStatus })
      .eq("id", id)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data: data,
      message: `User status changed to ${newStatus}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};
