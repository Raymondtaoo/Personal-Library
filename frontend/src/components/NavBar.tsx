import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between">
        <Link href="/" className="mr-6 hover:text-gray-300">Home</Link>
        <Link href="/books" className="mr-6 hover:text-gray-300">Books</Link>
        <Link href="/users" className="mr-6 hover:text-gray-300">User</Link>
        <Link href="/loans" className="mr-6 hover:text-gray-300">Loans</Link>
        <Link href="/reviews" className="hover:text-gray-300">Reviews</Link>
      </div>
    </nav>
  );
};

export default Navbar;
