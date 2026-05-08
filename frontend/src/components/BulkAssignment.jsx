import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Users, 
  FileText, 
  Calendar, 
  CheckSquare, 
  Plus,
  X,
  Search,
  Filter,
  Clock,
  AlertCircle
} from 'lucide-react';
import api from '../api/axios';

const BulkAssignment = ({ projectId, onAssignmentComplete }) => {
  const qc = useQueryClient();
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [assignmentData, setAssignmentData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIUM',
    type: 'ASSIGNMENT'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(1); // 1: Select students, 2: Create assignment

  useEffect(() => {
    // Load actual project members for bulk assignment
    const loadProjectMembers = async () => {
      try {
        const response = await api.get(`/projects/${projectId}`);
        const project = response.data;
        const members = project.members || [];
        setStudents(members.map(m => ({
          id: m.user._id,
          name: m.user.name,
          email: m.user.email,
          enrolledCourses: m.user.enrolledCourses || []
        })));
      } catch (error) {
        console.error('Error loading project members:', error);
        toast.error('Failed to load project members');
      }
    };

    loadProjectMembers();
  }, [projectId]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student.id));
    }
  };

  const createBulkAssignment = useMutation({
    mutationFn: (data) => api.post(`/tasks/bulk-assign/project/${projectId}`, data),
    onSuccess: (response) => {
      toast.success(`Successfully assigned tasks to ${response.data.tasks.length} students`);
      qc.invalidateQueries({ queryKey: ['tasks', projectId] });
      onAssignmentComplete && onAssignmentComplete();
      
      // Reset form
      setAssignmentData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'MEDIUM',
        type: 'ASSIGNMENT'
      });
      setSelectedStudents([]);
      setStep(1);
      setIsCreating(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create assignment');
      setIsCreating(false);
    }
  });

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    createBulkAssignment.mutate({
      taskData: assignmentData,
      assignedUsers: selectedStudents
    });
  };

  const StudentCard = ({ student }) => {
    const isSelected = selectedStudents.includes(student.id);
    
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => toggleStudentSelection(student.id)}
        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
          isSelected 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
            }`}>
              {isSelected && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{student.name}</p>
              <p className="text-sm text-gray-500">{student.email}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {student.enrolledCourses.map((course, index) => (
                  <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {course}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Bulk Assignment Creator</h2>
                <p className="text-sm text-gray-500">
                  {step === 1 ? 'Select students to assign this task to' : 'Create the assignment details'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <span>Step</span>
                <span className="font-medium text-gray-900">{step}</span>
                <span>of</span>
                <span className="font-medium text-gray-900">2</span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Progress</span>
              <span className="text-xs text-gray-500">{step * 50}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${step * 50}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {step === 1 ? (
            /* Step 1: Select Students */
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search students by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={selectAllStudents}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Selected Count */}
              {selectedStudents.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedStudents([])}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear selection
                  </button>
                </div>
              )}

              {/* Student List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredStudents.map(student => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={selectedStudents.length === 0 || isCreating}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    selectedStudents.length > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue to Assignment Details
                </button>
              </div>
            </div>
          ) : (
            /* Step 2: Create Assignment */
            <form onSubmit={handleAssignmentSubmit} className="space-y-6">
              {/* Selected Students Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">
                      This assignment will be sent to {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Change selection
                  </button>
                </div>
              </div>

              {/* Assignment Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={assignmentData.title}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Math Homework Chapter 5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={assignmentData.description}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Provide detailed instructions for this assignment..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={assignmentData.dueDate}
                      onChange={(e) => setAssignmentData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={assignmentData.priority}
                      onChange={(e) => setAssignmentData(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['ASSIGNMENT', 'QUIZ', 'PROJECT', 'EXAM'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAssignmentData(prev => ({ ...prev, type }))}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          assignmentData.type === type
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Assignment...</span>
                    </div>
                  ) : (
                    `Create Assignment for ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkAssignment;
