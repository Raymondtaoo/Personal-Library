use postgres::{ Client, NoTls };
use postgres::Error as PostgresError;
use std::net::{ TcpListener, TcpStream };
use std::io::{ Read, Write };
use std::env;

#[macro_use]
extern crate serde_derive;

//User struct with id, name and email
#[derive(Serialize, Deserialize)]
struct User {
    id: Option<i32>,
    name: String,
    email: String,
}

//Book struct with id, title, author and genre
#[derive(Serialize, Deserialize)]
struct Book {
    id: Option<i32>,
    title: String,
    author: String,
    genre: Option<String>,
}

//Loan struct with id, title, author and genre
#[derive(Serialize, Deserialize)]
struct Loan {
    id: Option<i32>,
    user_id: i32,
    book_id: i32,
    checkout_date: String,
    due_date: String,
    return_date: Option<String>,
}

//Review struct with id, title, author and genre
#[derive(Serialize, Deserialize)]
struct Review {
    id: Option<i32>,
    book_id: i32,
    user_id: i32,
    rating: i32,
    review_text: Option<String>,
}

//DB URL
const DB_URL: &str = env!("DATABASE_URL");

//Constraints
const OK_RESPONSE: &str =
    "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, POST, PUT, DELETE\r\nAccess-Control-Allow-Headers: Content-Type\r\n\r\n";
const NOT_FOUND: &str = "HTTP/1.1 404 NOT FOUND\r\n\r\n";
const INTERNAL_ERROR: &str = "HTTP/1.1 500 INTERNAL ERROR\r\n\r\n";

//main function
fn main() {
    //Set DB
    if let Err(_) = set_database() {
        println!("Error setting database");
        return;
    }

    //start server and print port
    let listener = TcpListener::bind(format!("0.0.0.0:8080")).unwrap();
    println!("Server listening on port 8080");

    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                handle_client(stream);
            }
            Err(e) => {
                println!("Unable to connect: {}", e);
            }
        }
    }
}

//DB Setup
fn set_database() -> Result<(), PostgresError> {
    let mut client = Client::connect(DB_URL, NoTls)?;
    client.batch_execute(
        "
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR NOT NULL,
            email VARCHAR NOT NULL
        )
    "
    )?;

    client.batch_execute(
        "
        CREATE TABLE IF NOT EXISTS books (
            id SERIAL PRIMARY KEY,
            title VARCHAR NOT NULL,
            author VARCHAR NOT NULL,
            genre VARCHAR
        )
        "
    )?;

    client.batch_execute(
        "
        CREATE TABLE IF NOT EXISTS loans (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            book_id INTEGER REFERENCES books(id),
            checkout_date VARCHAR NOT NULL,
            due_date VARCHAR NOT NULL,
            return_date VARCHAR
        )
        "
    )?;

    client.batch_execute(
        "
        CREATE TABLE IF NOT EXISTS reviews (
            id SERIAL PRIMARY KEY,
            book_id INTEGER REFERENCES books(id),
            user_id INTEGER REFERENCES users(id),
            rating INTEGER NOT NULL,
            review_text TEXT
        )
        "
    )?;    
    Ok(())
}

//Get id from request URL
fn get_id(request: &str) -> &str {
    request.split("/").nth(4).unwrap_or_default().split_whitespace().next().unwrap_or_default()
}

//deserialize user from request body without id
fn get_user_request_body(request: &str) -> Result<User, serde_json::Error> {
    serde_json::from_str(request.split("\r\n\r\n").last().unwrap_or_default())
}

//deserialize book from request body without id
fn get_book_request_body(request: &str) -> Result<Book, serde_json::Error> {
    serde_json::from_str(request.split("\r\n\r\n").last().unwrap_or_default())
}

//deserialize loan from request body without id
fn get_loan_request_body(request: &str) -> Result<Loan, serde_json::Error> {
    serde_json::from_str(request.split("\r\n\r\n").last().unwrap_or_default())
}

//deserialize review from request body without id
fn get_review_request_body(request: &str) -> Result<Review, serde_json::Error> {
    serde_json::from_str(request.split("\r\n\r\n").last().unwrap_or_default())
}

//handle requests
fn handle_client(mut stream: TcpStream) {
    let mut buffer = [0; 1024];
    let mut request = String::new();

    match stream.read(&mut buffer) {
        Ok(size) => {
            request.push_str(String::from_utf8_lossy(&buffer[..size]).as_ref());

            let (status_line, content) = match &*request {
                r if r.starts_with("OPTIONS") => (OK_RESPONSE.to_string(), "".to_string()),
                r if r.starts_with("POST /api/rust/users") => handle_post_user_request(r),
                r if r.starts_with("GET /api/rust/users/") => handle_get_user_request(r),
                r if r.starts_with("GET /api/rust/users") => handle_get_all_user_request(r),
                r if r.starts_with("PUT /api/rust/users/") => handle_put_user_request(r),
                r if r.starts_with("DELETE /api/rust/users/") => handle_delete_user_request(r),

                r if r.starts_with("POST /api/rust/books") => handle_post_book_request(r),
                r if r.starts_with("GET /api/rust/books/") => handle_get_book_request(r),
                r if r.starts_with("GET /api/rust/books") => handle_get_all_book_request(r),
                r if r.starts_with("PUT /api/rust/books/") => handle_put_book_request(r),
                r if r.starts_with("DELETE /api/rust/books/") => handle_delete_book_request(r),

                r if r.starts_with("POST /api/rust/loans") => handle_post_loan_request(r),
                r if r.starts_with("GET /api/rust/loans/") => handle_get_loan_request(r),
                r if r.starts_with("GET /api/rust/loans") => handle_get_all_loan_request(r),
                r if r.starts_with("PUT /api/rust/loans/") => handle_put_loan_request(r),
                r if r.starts_with("DELETE /api/rust/loans/") => handle_delete_loan_request(r),

                r if r.starts_with("POST /api/rust/reviews") => handle_post_review_request(r),
                r if r.starts_with("GET /api/rust/reviews/") => handle_get_review_request(r),
                r if r.starts_with("GET /api/rust/reviews") => handle_get_all_review_request(r),
                r if r.starts_with("PUT /api/rust/reviews/") => handle_put_review_request(r),
                r if r.starts_with("DELETE /api/rust/reviews/") => handle_delete_review_request(r),

                _ => (NOT_FOUND.to_string(), "404 not found".to_string()),
            };

            stream.write_all(format!("{}{}", status_line, content).as_bytes()).unwrap();
        }
        Err(e) => eprintln!("Unable to read stream: {}", e),
    }
}

//handle post user request
fn handle_post_user_request(request: &str) -> (String, String) {
    match (get_user_request_body(request), Client::connect(DB_URL, NoTls)) {
        (Ok(user), Ok(mut client)) => {
            // Insert the user and retrieve the ID
            let row = client
                .query_one(
                    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id",
                    &[&user.name, &user.email]
                )
                .unwrap();

            let user_id: i32 = row.get(0);

            // Fetch the created user data
            match client.query_one("SELECT id, name, email FROM users WHERE id = $1", &[&user_id]) {
                Ok(row) => {
                    let user = User {
                        id: Some(row.get(0)),
                        name: row.get(1),
                        email: row.get(2),
                    };

                    (OK_RESPONSE.to_string(), serde_json::to_string(&user).unwrap())
                }
                Err(_) =>
                    (INTERNAL_ERROR.to_string(), "Failed to retrieve created user".to_string()),
            }
        }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}

//handle post book request
fn handle_post_book_request(request: &str) -> (String, String) {
    match (get_book_request_body(request), Client::connect(DB_URL, NoTls)) {
        (Ok(book), Ok(mut client)) => {
            // Insert the book and retrieve the ID
            let row = client
                .query_one(
                    "INSERT INTO books (title, author, genre) VALUES ($1, $2, $3) RETURNING id",
                    &[&book.title, &book.author, &book.genre]
                )
                .unwrap();

            let book_id: i32 = row.get(0);

            // Fetch the created book data
            match client.query_one("SELECT id, title, author, genre FROM books WHERE id = $1", &[&book_id]) {
                Ok(row) => {
                    let book = Book {
                        id: Some(row.get(0)),
                        title: row.get(1),
                        author: row.get(2),
                        genre: row.get(3),
                    };

                    (OK_RESPONSE.to_string(), serde_json::to_string(&book).unwrap())
                }
                Err(_) =>
                    (INTERNAL_ERROR.to_string(), "Failed to retrieve created book".to_string()),
            }
        }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}

//handle post loan request
fn handle_post_loan_request(request: &str) -> (String, String) {
    match (get_loan_request_body(request), Client::connect(DB_URL, NoTls)) {
        (Ok(loan), Ok(mut client)) => {
            // Insert the loan and retrieve the ID
            let row = client
                .query_one(
                    "INSERT INTO loans (user_id, book_id, checkout_date, due_date, return_date) VALUES ($1, $2, $3, $4, $5) RETURNING id",
                    &[&loan.user_id, &loan.book_id, &loan.checkout_date, &loan.due_date, &loan.return_date]
                )
                .unwrap();

            let loan_id: i32 = row.get(0);

            // Fetch the created loan data
            match client.query_one("SELECT id, user_id, book_id, checkout_date, due_date, return_date FROM loans WHERE id = $1", &[&loan_id]) {
                Ok(row) => {
                    let loan = Loan {
                        id: Some(row.get(0)),
                        user_id: row.get(1),
                        book_id: row.get(2),
                        checkout_date: row.get(3),
                        due_date: row.get(4),
                        return_date: row.get(5),
                    };

                    (OK_RESPONSE.to_string(), serde_json::to_string(&loan).unwrap())
                }
                Err(_) =>
                    (INTERNAL_ERROR.to_string(), "Failed to retrieve created loan".to_string()),
            }
        }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}

//handle post review request
fn handle_post_review_request(request: &str) -> (String, String) {
    match (get_review_request_body(request), Client::connect(DB_URL, NoTls)) {
        (Ok(review), Ok(mut client)) => {
            // Insert the review and retrieve the ID
            let row = client
                .query_one(
                    "INSERT INTO reviews (book_id, user_id, rating, review_text) VALUES ($1, $2, $3, $4) RETURNING id",
                    &[&review.book_id, &review.user_id, &review.rating, &review.review_text]
                )
                .unwrap();

            let review_id: i32 = row.get(0);

            // Fetch the created review data
            match client.query_one("SELECT id, book_id, user_id, rating, review_text FROM reviews WHERE id = $1", &[&review_id]) {
                Ok(row) => {
                    let review = Review {
                        id: Some(row.get(0)),
                        book_id: row.get(1),
                        user_id: row.get(2),
                        rating: row.get(3),
                        review_text: row.get(4),
                    };

                    (OK_RESPONSE.to_string(), serde_json::to_string(&review).unwrap())
                }
                Err(_) =>
                    (INTERNAL_ERROR.to_string(), "Failed to retrieve created review".to_string()),
            }
        }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}

//handle get user request
fn handle_get_user_request(request: &str) -> (String, String) {
    match (get_id(&request).parse::<i32>(), Client::connect(DB_URL, NoTls)) {
        (Ok(id), Ok(mut client)) =>
            match client.query_one("SELECT * FROM users WHERE id = $1", &[&id]) {
                Ok(row) => {
                    let user = User {
                        id: row.get(0),
                        name: row.get(1),
                        email: row.get(2),
                    };

                    (OK_RESPONSE.to_string(), serde_json::to_string(&user).unwrap())
                }
                _ => (NOT_FOUND.to_string(), "User not found".to_string()),
            }

        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}

//handle get book request
fn handle_get_book_request(request: &str) -> (String, String) {
    match (get_id(&request).parse::<i32>(), Client::connect(DB_URL, NoTls)) {
        (Ok(id), Ok(mut client)) =>
            match client.query_one("SELECT * FROM books WHERE id = $1", &[&id]) {
                Ok(row) => {
                    let book = Book {
                        id: row.get(0),
                        title: row.get(1),
                        author: row.get(2),
                        genre: row.get(3),
                    };

                    (OK_RESPONSE.to_string(), serde_json::to_string(&book).unwrap())
                }
                _ => (NOT_FOUND.to_string(), "Book not found".to_string()),
            }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}

//handle get loan request
fn handle_get_loan_request(request: &str) -> (String, String) {
    match (get_id(&request).parse::<i32>(), Client::connect(DB_URL, NoTls)) {
        (Ok(id), Ok(mut client)) =>
            match client.query_one("SELECT * FROM loans WHERE id = $1", &[&id]) {
                Ok(row) => {
                    let loan = Loan {
                        id: row.get(0),
                        user_id: row.get(1),
                        book_id: row.get(2),
                        checkout_date: row.get(3),
                        due_date: row.get(4),
                        return_date: row.get(5),
                    };

                    (OK_RESPONSE.to_string(), serde_json::to_string(&loan).unwrap())
                }
                _ => (NOT_FOUND.to_string(), "Loan not found".to_string()),
            }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}

//handle get review request
fn handle_get_review_request(request: &str) -> (String, String) {
    match (get_id(&request).parse::<i32>(), Client::connect(DB_URL, NoTls)) {
        (Ok(id), Ok(mut client)) =>
            match client.query_one("SELECT * FROM reviews WHERE id = $1", &[&id]) {
                Ok(row) => {
                    let review = Review {
                        id: row.get(0),
                        book_id: row.get(1),
                        user_id: row.get(2),
                        rating: row.get(3),
                        review_text: row.get(4),
                    };

                    (OK_RESPONSE.to_string(), serde_json::to_string(&review).unwrap())
                }
                _ => (NOT_FOUND.to_string(), "Review not found".to_string()),
            }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}

//handle get all user request
fn handle_get_all_user_request(_request: &str) -> (String, String) {
    match Client::connect(DB_URL, NoTls) {
        Ok(mut client) => {
            let mut users = Vec::new(); // Vector to store the users

            for row in client.query("SELECT id, name, email FROM users", &[]).unwrap() {
                users.push(User {
                    id: row.get(0),
                    name: row.get(1),
                    email: row.get(2),
                });
            }

            (OK_RESPONSE.to_string(), serde_json::to_string(&users).unwrap())
        }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}

//handle get all book request
fn handle_get_all_book_request(_request: &str) -> (String, String) {
    match Client::connect(DB_URL, NoTls) {
        Ok(mut client) => {
            let mut books = Vec::new(); // Vector to store the books

            for row in client.query("SELECT id, title, author, genre FROM books", &[]).unwrap() {
                books.push(Book {
                    id: row.get(0),
                    title: row.get(1),
                    author: row.get(2),
                    genre: row.get(3),
                });
            }

            (OK_RESPONSE.to_string(), serde_json::to_string(&books).unwrap())
        }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}

//handle get all loan request
fn handle_get_all_loan_request(_request: &str) -> (String, String) {
    match Client::connect(DB_URL, NoTls) {
        Ok(mut client) => {
            let mut loans = Vec::new(); // Vector to store the loans

            for row in client.query("SELECT id, user_id, book_id, checkout_date, due_date, return_date FROM loans", &[]).unwrap() {
                loans.push(Loan {
                    id: row.get(0),
                    user_id: row.get(1),
                    book_id: row.get(2),
                    checkout_date: row.get(3),
                    due_date: row.get(4),
                    return_date: row.get(5),
                });
            }

            (OK_RESPONSE.to_string(), serde_json::to_string(&loans).unwrap())
        }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}

//handle get all review request
fn handle_get_all_review_request(_request: &str) -> (String, String) {
    match Client::connect(DB_URL, NoTls) {
        Ok(mut client) => {
            let mut reviews = Vec::new(); // Vector to store the reviews

            for row in client.query("SELECT id, book_id, user_id, rating, review_text FROM reviews", &[]).unwrap() {
                reviews.push(Review {
                    id: row.get(0),
                    book_id: row.get(1),
                    user_id: row.get(2),
                    rating: row.get(3),
                    review_text: row.get(4),
                });
            }

            (OK_RESPONSE.to_string(), serde_json::to_string(&reviews).unwrap())
        }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}

//handle put user request
fn handle_put_user_request(request: &str) -> (String, String) {
    match
        (
            get_id(&request).parse::<i32>(),
            get_user_request_body(&request),
            Client::connect(DB_URL, NoTls),
        )
    {
        (Ok(id), Ok(user), Ok(mut client)) => {
            client
                .execute(
                    "UPDATE users SET name = $1, email = $2 WHERE id = $3",
                    &[&user.name, &user.email, &id]
                )
                .unwrap();

            (OK_RESPONSE.to_string(), "User updated".to_string())
        }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}

//handle put book request
fn handle_put_book_request(request: &str) -> (String, String) {
    match
        (
            get_id(&request).parse::<i32>(),
            get_book_request_body(&request),
            Client::connect(DB_URL, NoTls),
        )
    {
        (Ok(id), Ok(book), Ok(mut client)) => {
            client
                .execute(
                    "UPDATE books SET title = $1, author = $2, genre = $3 WHERE id = $4",
                    &[&book.title, &book.author, &book.genre, &id]
                )
                .unwrap();

            (OK_RESPONSE.to_string(), "Book updated".to_string())
        }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}

//handle put loan request
fn handle_put_loan_request(request: &str) -> (String, String) {
    match
        (
            get_id(&request).parse::<i32>(),
            get_loan_request_body(&request),
            Client::connect(DB_URL, NoTls),
        )
    {
        (Ok(id), Ok(loan), Ok(mut client)) => {
            client
                .execute(
                    "UPDATE loans SET user_id = $1, book_id = $2, checkout_date = $3, due_date = $4, return_date = $5 WHERE id = $6",
                    &[&loan.user_id, &loan.book_id, &loan.checkout_date, &loan.due_date, &loan.return_date, &id]
                )
                .unwrap();

            (OK_RESPONSE.to_string(), "Loan updated".to_string())
        }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}

//handle put review request
fn handle_put_review_request(request: &str) -> (String, String) {
    match
        (
            get_id(&request).parse::<i32>(),
            get_review_request_body(&request),
            Client::connect(DB_URL, NoTls),
        )
    {
        (Ok(id), Ok(review), Ok(mut client)) => {
            client
                .execute(
                    "UPDATE reviews SET book_id = $1, user_id = $2, rating = $3, review_text = $4 WHERE id = $5",
                    &[&review.book_id, &review.user_id, &review.rating, &review.review_text, &id]
                )
                .unwrap();

            (OK_RESPONSE.to_string(), "Review updated".to_string())
        }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}

//handle delete user request
fn handle_delete_user_request(request: &str) -> (String, String) {
    match (get_id(&request).parse::<i32>(), Client::connect(DB_URL, NoTls)) {
        (Ok(id), Ok(mut client)) => {
            let rows_affected = client.execute("DELETE FROM users WHERE id = $1", &[&id]).unwrap();

            //if rows affected is 0, user not found
            if rows_affected == 0 {
                return (NOT_FOUND.to_string(), "User not found".to_string());
            }

            (OK_RESPONSE.to_string(), "User deleted".to_string())
        }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}

//handle delete book request
fn handle_delete_book_request(request: &str) -> (String, String) {
    match (get_id(&request).parse::<i32>(), Client::connect(DB_URL, NoTls)) {
        (Ok(id), Ok(mut client)) => {
            let rows_affected = client.execute("DELETE FROM books WHERE id = $1", &[&id]).unwrap();

            //if rows affected is 0, book not found
            if rows_affected == 0 {
                return (NOT_FOUND.to_string(), "Book not found".to_string());
            }

            (OK_RESPONSE.to_string(), "Book deleted".to_string())
        }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}

//handle delete loan request
fn handle_delete_loan_request(request: &str) -> (String, String) {
    match (get_id(&request).parse::<i32>(), Client::connect(DB_URL, NoTls)) {
        (Ok(id), Ok(mut client)) => {
            let rows_affected = client.execute("DELETE FROM loans WHERE id = $1", &[&id]).unwrap();

            //if rows affected is 0, loan not found
            if rows_affected == 0 {
                return (NOT_FOUND.to_string(), "Loan not found".to_string());
            }

            (OK_RESPONSE.to_string(), "Loan deleted".to_string())
        }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}

//handle delete review request
fn handle_delete_review_request(request: &str) -> (String, String) {
    match (get_id(&request).parse::<i32>(), Client::connect(DB_URL, NoTls)) {
        (Ok(id), Ok(mut client)) => {
            let rows_affected = client.execute("DELETE FROM reviews WHERE id = $1", &[&id]).unwrap();

            //if rows affected is 0, review not found
            if rows_affected == 0 {
                return (NOT_FOUND.to_string(), "Review not found".to_string());
            }

            (OK_RESPONSE.to_string(), "Review deleted".to_string())
        }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}
