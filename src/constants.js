export const DB_NAME = "hybr1d";

export const USER_TYPE_ENUM = {
  BUYER: "BUYER",
  SELLER: "SELLER",
};
export const AVAILABLE_USER_TYPES = Object.values(USER_TYPE_ENUM);

export const ORDER_STATUS_ENUM = {
  PENDING: "PENDING",
  CANCELLED: "CANCELLED",
  DELIVERED: "COMPLETED",
};

export const AVAILABLE_ORDER_STATUS_ENUM = Object.values(ORDER_STATUS_ENUM);

export const DELIVERY_STATUS_ENUM = {
  PENDING: "PENDING",
  IN_TRANSIT: "IN TRANSIT",
  DELIVERED: "COMPLETED",
  FAILED: "CANCELLED",
};

export const AVAILABLE_DELIVERY_STATUS_ENUM =
  Object.values(DELIVERY_STATUS_ENUM);
