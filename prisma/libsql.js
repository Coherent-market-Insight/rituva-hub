// This is the prisma configuration for Turso support
// See: https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/turso-orms

const { createClient } = require("@libsql/client");

let libsqlClient;

async function getLibsqlClient() {
  if (!libsqlClient) {
    libsqlClient = createClient({
      url: process.env.DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
  }
  return libsqlClient;
}

module.exports = {
  getLibsqlClient,
};

