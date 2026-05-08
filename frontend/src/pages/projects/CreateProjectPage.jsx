import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { createProjectApi } from "../../api/project.api";
import { listUsersApi } from "../../api/user.api";
import PageWrapper from "../../components/layout/PageWrapper";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const schema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  deadline: z.string().optional(),
  assignedUsers: z.array(z.string()).optional(),
});

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [projectFiles, setProjectFiles] = useState([]);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: listUsersApi,
    select: (data) => {
      // Normalize response to ensure it's always an array
      if (Array.isArray(data)) {
        return data;
      }
      if (data?.users && Array.isArray(data.users)) {
        return data.users;
      }
      if (data?.members && Array.isArray(data.members)) {
        return data.members;
      }
      return [];
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const fileObjects = files.map(file => ({
      name: file.name,
      type: getFileType(file.name),
      size: file.size,
      actualFile: file
    }));
    setProjectFiles([...projectFiles, ...fileObjects]);
  };

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg']?.includes(ext)) return 'image';
    if (['pdf', 'doc', 'docx']?.includes(ext)) return 'document';
    if (['js', 'jsx', 'ts', 'tsx', 'html', 'css']?.includes(ext)) return 'code';
    if (['zip', 'rar', 'tar']?.includes(ext)) return 'archive';
    return 'file';
  };

  const addFile = () => {
    setProjectFiles([...projectFiles, { name: '', type: 'file', isNew: true }]);
  };

  const updateFile = (index, field, value) => {
    const updatedFiles = [...projectFiles];
    updatedFiles[index][field] = value;
    setProjectFiles(updatedFiles);
  };

  const removeFile = (index) => {
    setProjectFiles(projectFiles.filter((_, i) => i !== index));
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const onSubmit = async (values) => {
    try {
      const projectData = {
        ...values,
        assignedUsers: selectedUsers,
        files: projectFiles,
        members: selectedUsers.map(userId => ({
          user: userId,
          role: "MEMBER",
          permissions: {
            canViewTasks: true,
            canCreateTasks: false,
            canAssignTasks: false,
            canViewAnalytics: false,
            canManageMembers: false
          }
        }))
      };
      
      await createProjectApi(projectData);
      toast.success("Project created and tasks assigned to users");
      navigate("/projects");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create project");
    }
  };

  return (
    <PageWrapper>
      <div className="p-6 max-w-4xl">
        <h1 className="text-2xl font-semibold mb-6">Create New Project</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Basic Project Info */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-medium mb-4">Project Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input {...register("name")} label="Project name *" error={errors.name?.message} />
              <Input {...register("deadline")} type="date" label="Project deadline" />
            </div>
            <label className="block mt-4">
              <span className="mb-1 block text-sm font-medium">Description</span>
              <textarea {...register("description")} className="w-full rounded-md border border-slate-300 p-2" rows={4} />
            </label>
          </div>

          {/* Project Files */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Project Files & Folders</h2>
              <div className="flex gap-2">
                <input
                  key={fileInputKey}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <Button type="button" onClick={() => document.getElementById('file-upload').click()} variant="secondary">
                  📁 Upload Files
                </Button>
                <Button type="button" onClick={addFile} variant="secondary">Add Folder</Button>
              </div>
            </div>
            
            {projectFiles.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115 9a5 5 0 011.9 3.954 5 5 0 01.9 3.954A5 5 0 0117 9a5 5 0 01.88 7.903A4 4 0 017 16z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm mb-2">No files uploaded yet</p>
                <p className="text-slate-600 text-sm">Click "Upload Files" to select files from your computer or local storage</p>
              </div>
            ) : (
              <div className="space-y-2">
                {projectFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-2xl">
                        {file.type === 'folder' ? '📁' :
                         file.type === 'image' ? '🖼️' :
                         file.type === 'document' ? '📝' :
                         file.type === 'code' ? '💻' :
                         file.type === 'archive' ? '📦' : '📄'}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{file.name}</p>
                        {file.size && (
                          <p className="text-xs text-slate-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        )}
                        {file.uploadedAt && (
                          <p className="text-xs text-slate-500">
                            Uploaded {new Date(file.uploadedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button type="button" onClick={() => removeFile(index)} variant="danger" size="sm">
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Assignment */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-medium mb-4">Assign Team Members</h2>
            <p className="text-sm text-slate-600 mb-4">Select users who will work on this project. They will automatically receive project tasks.</p>
            
            {users.length === 0 ? (
              <p className="text-slate-500">No users available. Add users to assign them to projects.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {users.filter(user => user.role === 'MEMBER').map(user => (
                  <div
                    key={user._id}
                    onClick={() => toggleUserSelection(user._id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedUsers.includes(user._id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedUsers.includes(user._id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-slate-300'
                      }`}>
                        {selectedUsers.includes(user._id) && (
                          <svg className="w-2 h-2 text-white m-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {selectedUsers.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  {selectedUsers.length} member{selectedUsers.length !== 1 ? 's' : ''} selected for project assignment
                </p>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button type="button" onClick={() => navigate("/projects")} variant="secondary">Cancel</Button>
            <Button loading={isSubmitting} disabled={selectedUsers.length === 0}>
              Create Project & Assign Tasks
            </Button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
}
