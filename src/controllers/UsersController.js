const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");
const knex = require("../database/knex");

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body;
    const checkUserExists = await knex("users").where({ email }).first();

    if (checkUserExists) {
      throw new AppError("Este email já está em uso.");
    }

    const hashedPassword = await hash(password, 8);

    await knex("users").insert({ name, email, hashedPassword });

    return response.status(201).json({});
  }

  async update(request, response) {
    const { name, email, password, old_password } = request.body;
    const user_id = request.user.id;

    const user = await knex("users").where({ id: user_id }).first();

    if (!user) {
      throw new AppError("Usuário não encontrado.");
    }

    const userWithUpdatedEmail = await knex("users").where({ email }).first();

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError("O email já está em uso.");
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if (password && !old_password) {
      throw new AppError("Você precisa informar a senha antiga para definir a nova senha.");
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password);
      if (!checkOldPassword) {
        throw new AppError("A senha antiga não confere");
      }

      user.password = await hash(password, 8);
    }

    const userUpdated = await knex("users").where({ id: user.id }).update({
      username: user.name,
      email: user.email,
      password: user.password,
    });
    if (!userUpdated) {
      throw new AppError("Não foi possível atualizar o usuario");
    }

    return response.status(200).json({ message: "Usuário atualizado com sucesso!" });
  }
}

module.exports = UsersController;

const knex = require("../database/knex");

class NotesController {
  async create(request, response) {
    const { title, description, tags, links } = request.body;
    const user_id = request.user.id;

    const [note_id] = await knex("notes").insert({
      title,
      description,
      user_id,
    });

    const linksInsert = links.map((link) => {
      return {
        note_id,
        url: link,
      };
    });
    await knex("links").insert(linksInsert);

    const tagsInsert = tags.map((name) => {
      return {
        note_id,
        name,
        user_id,
      };
    });
    await knex("tags").up(tagsInsert);
    return response.json();
  }
  async show(request, response) {
    const { id } = request.params;

    const note = await knex("notes").where({ id }).first();
    const tags = await knex("tags").where({ note_id: id }).orderBy("name");
    const links = await knex("links").where({ note_id: id }).orderBy("created_at");

    return response.json({ ...note, tags, links });
  }
  async delete(request, response) {
    const { id } = request.params;

    await knex("notes").where({ id }).delete();
    return response.json();
  }
  async index(request, response) {
    // Extrai parâmetros da consulta da requisição
    const { title, tags } = request.query;
    const user_id = request.user.id;
    // Inicializa uma variável para armazenar as notas
    let notes;

    // Verifica se há tags na consulta
    if (tags) {
      // Se houver tags, filtra as notas por essas tags usando o Knex

      const filterTags = tags.split(",").map((tag) => tag.trim());
      notes = await knex("tags")
        .select(["notes.id", "notes.title", "notes.user_id"])
        .where("notes.user_id", user_id)
        .whereLike("notes.title", `%${title}%`)
        .whereIn("name", filterTags)
        .innerJoin("notes", "notes.id", "tags.note_id")
        .groupBy("notes.id")
        .orderBy("notes.title");
    } else {
      // Se não houver tags, filtra as notas por título e user_id usando o Knex

      notes = await knex("notes").where({ user_id }).whereLike("title", `%${title}%`).orderBy("title");
    }

    const userTags = await knex("tags").where({ user_id });
    const notesWithTags = notes.map((note) => {
      const noteTags = userTags.filter((tag) => tag.note_id === note.id);

      return {
        ...note,
        tags: noteTags,
      };
    });

    // Retorna as notas e suas tags em formato JSON como resposta à requisição

    return response.json(notesWithTags);
  }
}

module.exports = NotesController;
