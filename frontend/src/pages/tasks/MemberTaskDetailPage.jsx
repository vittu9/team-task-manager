import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, useRef } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { getTaskApi, updateTaskStatusApi, uploadTaskFilesApi } from "../../api/task.api";
import { useAuthStore } from "../../store/authStore";

const STATUSES = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

export default function MemberTaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [comment, setComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", id],
    queryFn: () => getTaskApi(id),
  });

  const updateStatus = useMutation({
    mutationFn: (status) => updateTaskStatusApi(id, status),
    onSuccess: () => {
      toast.success("Task status updated");
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      queryClient.invalidateQueries({ queryKey: ["member-tasks"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update status"),
  });

  const addComment = () => {
    if (comment.trim()) {
      toast.success("Comment added successfully");
      setComment('');
      setShowCommentForm(false);
      // In a real app, this would save the comment to the backend
    }
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      await uploadTaskFilesApi(id, formData);
      toast.success("Files uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["task", id] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload files");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-slate-500">Loading task details...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!task) {
    return (
      <PageWrapper>
        <div className="p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Task not found</h3>
            <p className="text-slate-600 mb-4">The task you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => navigate("/member/tasks")}>Back to My Tasks</Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DONE': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'IN_REVIEW': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf':
        return (
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
      case 'doc':
      case 'docx':
        return (
          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
      case 'xls':
      case 'xlsx':
        return (
          <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
      case 'zip':
      case 'rar':
        return (
          <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Task Header */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/member/tasks")}
                  className="text-slate-600 hover:text-slate-900"
                >
                  ← Back to Tasks
                </Button>
                <div className="h-8 w-px bg-slate-300"></div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 text-sm font-semibold rounded-lg ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className={`px-4 py-2 text-sm font-semibold rounded-lg ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Task Title & Meta */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{task.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {task.assignedBy?.name || 'Admin'}
                      </span>
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {task.project?.name || 'No Project'}
                      </span>
                    </div>
                  </div>
                  {isOverdue(task.dueDate) && (
                    <div className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-lg">
                      ⚠️ Overdue
                    </div>
                  )}
                </div>
              </div>

              {/* Project Summary Section */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900">Project Context</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-slate-900 mb-2">Project Overview</h3>
                    <p className="text-slate-600 leading-relaxed">
                      {task.project?.description || 'This task is part of an important project initiative. Focus on delivering quality work that aligns with the project goals and timeline.'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 mb-2">Key Objectives</h3>
                    <ul className="space-y-2 text-slate-600">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>Complete task within the specified deadline</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>Follow all provided guidelines and requirements</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>Maintain high quality standards</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 mb-2">Important Instructions</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 text-sm">
                        Please review all attached files before starting. If you have questions, reach out to the project administrator for clarification.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Description */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900">Task Details</h2>
                </div>
                <div className="prose prose-slate max-w-none">
                  <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {task.description || 'No detailed description provided for this task.'}
                  </div>
                </div>
                
                {/* Required Deliverables */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="font-medium text-slate-900 mb-3">Required Deliverables</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-green-800 text-sm">Complete task according to specifications</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-blue-800 text-sm">Submit any required documentation</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Files & Resources */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900">Files & Resources</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">
                      {task.files?.length || 0} files
                    </span>
                    {user?.role === 'ADMIN' && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading || task.status === 'DONE'}
                          className="text-xs"
                        >
                          {isUploading ? (
                            <>
                              <svg className="w-3 h-3 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" strokeDasharray="31.416" strokeDashoffset="31.416" className="opacity-25"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Upload Files
                            </>
                          )}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => handleFileUpload(e.target.files)}
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                        />
                      </>
                    )}
                  </div>
                </div>
                
                {task.files && task.files.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {task.files.map((file, index) => (
                      <div key={index} className="group border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {getFileIcon(typeof file === 'string' ? file.split('/').pop() : file.filename || 'file')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-900 truncate mb-1">
                              {typeof file === 'string' ? file.split('/').pop() : file.filename || 'File'}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span>{formatFileSize(typeof file === 'object' ? file.size || 0 : 0)}</span>
                              <span>•</span>
                              <span>{new Date(typeof file === 'object' ? file.uploadedAt || Date.now() : Date.now()).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => window.open(typeof file === 'string' ? file : file.url, '_blank')}
                                className="text-xs"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Open
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = typeof file === 'string' ? file : file.url;
                                  link.download = typeof file === 'string' ? file.split('/').pop() : file.filename || 'file';
                                  link.click();
                                }}
                                className="text-xs"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                      {user?.role === 'ADMIN' ? 'No files attached' : 'No resources shared yet'}
                    </h3>
                    <p className="text-slate-500">
                      {user?.role === 'ADMIN' 
                        ? 'No resources have been uploaded for this task yet.' 
                        : 'No resources shared yet by the administrator.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Member Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900">Actions</h2>
                </div>
                
                {task.status !== 'DONE' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Update Status</label>
                      <select
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={task.status}
                        onChange={(e) => updateStatus.mutate(e.target.value)}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      {task.status === 'TODO' && (
                        <Button
                          onClick={() => updateStatus.mutate('IN_PROGRESS')}
                          disabled={updateStatus.isPending}
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Start Working
                        </Button>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <Button
                          variant="secondary"
                          onClick={() => updateStatus.mutate('IN_REVIEW')}
                          disabled={updateStatus.isPending}
                          className="w-full"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Mark Complete
                        </Button>
                      )}
                      {task.status === 'IN_REVIEW' && (
                        <Button
                          variant="secondary"
                          onClick={() => updateStatus.mutate('DONE')}
                          disabled={updateStatus.isPending}
                          className="w-full"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Mark as Done
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-green-900 mb-1">Task Completed!</h3>
                    <p className="text-green-700 text-sm">Great job on completing this task.</p>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900">Comments</h2>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowCommentForm(!showCommentForm)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </Button>
                </div>
                
                {showCommentForm && (
                  <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                    <textarea
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Add a comment or update..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={addComment}
                        disabled={!comment.trim()}
                      >
                        Post Comment
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setShowCommentForm(false);
                          setComment('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="text-center py-8 text-slate-500">
                    <svg className="w-8 h-8 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-sm">No comments yet</p>
                    <p className="text-xs">Be the first to add a comment</p>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-medium text-slate-900 mb-3">Quick Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Task ID</span>
                    <span className="font-mono text-slate-900">#{task._id?.slice(-6) || 'TASK001'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Created</span>
                    <span className="text-slate-900">{new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Updated</span>
                    <span className="text-slate-900">{new Date(task.updatedAt || task.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
