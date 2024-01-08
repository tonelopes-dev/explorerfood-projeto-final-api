exports.up = (knex) =>
  knex.schema.createTable("food_ingredient", (table) => {
    table.increments("id").primary();
    table.integer("food_id").references("id").inTable("foods").onDelete("CASCADE");

    table.string("name").notNullable().unique();

    table.timestamp("created_at").default(knex.fn.now());
  });

exports.down = (knex) => {
  knex.schema.dropTableIfExists("food_ingredient");
};
