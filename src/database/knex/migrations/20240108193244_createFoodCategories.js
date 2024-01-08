exports.up = (knex) =>
  knex.schema.createTable("food_categories", (table) => {
    table.increments("id").primary();
    table.integer("food_id").references("id").inTable("foods").onDelete("CASCADE");
    table.integer("user_id").references("id").inTable("users");
    table.string("name").notNullable().unique();

    table.timestamp("created_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
  });

exports.down = (knex) => {
  knex.schema.dropTableIfExists("food_categories");
};
