exports.up = (knex) =>
  knex.schema.createTable("food_ingredients", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.integer("user_id").references("id").inTable("users");
    table.integer("food_id").references("id").inTable("foods").onDelete("CASCADE");

    table.timestamp("created_at").default(knex.fn.now());
  });

exports.down = (knex) => {
  knex.schema.dropTableIfExists("food_ingredients");
};
