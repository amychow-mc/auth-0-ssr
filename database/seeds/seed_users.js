/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        { email: 'user1@example.com', name: 'User One', password: 'password1', is_migrated: false },
        { email: 'user2@example.com', name: 'User Two', password: 'password2', is_migrated: false },
        { email: 'user3@example.com', name: 'User Three', password: 'password3', is_migrated: true }
      ]);
    });
};
