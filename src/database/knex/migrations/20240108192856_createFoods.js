exports.up = (knex) =>
  knex.schema.createTable("foods", (table) => {
    table.increments("id").primary();
    table.string("url_image").unique();
    table.string("title").notNullable();
    table.string("description").notNullable();
    table.decimal("price", 10, 2).notNullable();

    table.enum("category", ["meal", "dessert", "drink"], { useNative: true, enumName: "categories" }).notNullable();

    table.integer("user_id").references("id").inTable("users");

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

exports.down = (knex) => {
  return knex.schema.dropTableIfExists("foods");
};
