import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "../../components/layout/PageWrapper";
import Badge from "../../components/ui/Badge";
import { listUsersApi, updateUserRoleApi } from "../../api/user.api";

export default function AdminPage() {
  const qc = useQueryClient();
  const { data: responseData = {} } = useQuery({ queryKey: ["users"], queryFn: listUsersApi });
  const users = responseData.members || [];
  const updateRole = useMutation({
    mutationFn: ({ id, role }) => updateUserRoleApi(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  return (
    <PageWrapper>
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-semibold">Admin Panel</h1>
        <div className="overflow-auto rounded-lg border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2"><Badge value={u.role} /></td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => updateRole.mutate({ id: u._id, role: u.role === "ADMIN" ? "MEMBER" : "ADMIN" })}
                      className="rounded bg-slate-200 px-3 py-1"
                    >
                      Toggle Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}
