import AddUserForm from "@/components/add-user";
import ShowUser from "@/components/show-user";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetch_users } from "@/lib/fetchers";
import { User } from "@prisma/client";

const Home = async () => {
  const users: User[] = await fetch_users();

  return (
    <div className="max-w-5xl mx-auto">
      {/* add user form */}
      <AddUserForm />

      <div className="border-b border-gray-600 py-3"></div>

      {/* users */}
      <h3 className="text-xl font-semibold my-3">Users</h3>
      <Table>
        <TableCaption>A list of added users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email Address</TableHead>
            <TableHead>Role</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <ShowUser key={user.id} user={user} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Home;
