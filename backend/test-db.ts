
import prisma from "./src/config/prisma";

async function main() {
  console.log("Attempting to connect to the database...");
  try {
    await prisma.$connect();
    console.log("? Successfully connected to the database!");
  } catch (error) {
    console.error("? Failed to connect to the database. Error details:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

