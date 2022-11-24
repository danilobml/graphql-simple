const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLNonNull } = require("graphql");
const { authors, books } = require("./data");

const app = express();

const AuthorType = new GraphQLObjectType({
	name: "Authors",
	description: "represents an author",
	fields: () => ({
		id: { type: new GraphQLNonNull(GraphQLInt) },
		name: { type: new GraphQLNonNull(GraphQLString) },
		books: {
			type: new GraphQLList(BookType),
			resolve: (author) => {
				return books.filter((book) => book.authorId === author.id);
			},
		},
	}),
});

const BookType = new GraphQLObjectType({
	name: "Books",
	description: "represents a book",
	fields: () => ({
		id: { type: new GraphQLNonNull(GraphQLInt) },
		name: { type: new GraphQLNonNull(GraphQLString) },
		authorId: { type: new GraphQLNonNull(GraphQLInt) },
		author: {
			type: AuthorType,
			resolve: (book) => {
				return authors.find((author) => author.id === book.authorId);
			},
		},
	}),
});

const RootQueryType = new GraphQLObjectType({
	name: "Query",
	description: "Root Query",
	fields: () => ({
		book: {
			type: BookType,
			description: "A Book",
			args: {
				id: {
					type: GraphQLInt,
				},
			},
			resolve: (parent, args) => {
				return books.find((book) => book.id === args.id);
			},
		},
		books: {
			type: new GraphQLList(BookType),
			description: "List of Books",
			resolve: () => books,
		},
		author: {
			type: AuthorType,
			description: "A single author",
			args: {
				id: {
					type: GraphQLInt,
				},
			},
			resolve: (parent, args) => {
				return authors.find((author) => author.id === args.id);
			},
		},
		authors: {
			type: new GraphQLList(AuthorType),
			description: "List of Authors",
			resolve: () => authors,
		},
	}),
});

const RootMutationType = new GraphQLObjectType({
	name: "Mutation",
	description: "Root Mutation",
	fields: () => ({
		addBook: {
			type: BookType,
			description: "Add a new book",
			args: {
				name: { type: new GraphQLNonNull(GraphQLString) },
				authorId: { type: new GraphQLNonNull(GraphQLInt) },
			},
			resolve: (parent, args) => {
				const book = {
					id: books.length + 1,
					name: args.name,
					authorId: args.authorId,
				};
				books.push(book);
				return book;
			},
		},
		addAuthor: {
			type: AuthorType,
			description: "Add a new Author",
			args: {
				name: { type: new GraphQLNonNull(GraphQLString) },
			},
			resolve: (parent, args) => {
				const author = {
					id: authors.length + 1,
					name: args.name,
				};
				authors.push(author);
				return author;
			},
		},
	}),
});

const schema = new GraphQLSchema({
	query: RootQueryType,
	mutation: RootMutationType,
});

app.use(
	"/graphql",
	graphqlHTTP({
		graphiql: true,
		schema,
	})
);

app.listen(5000, () => {
	console.log("Server listening on port 5000");
});
