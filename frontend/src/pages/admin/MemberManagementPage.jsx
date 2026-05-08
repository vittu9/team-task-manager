import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { listUsersApi } from '../../api/user.api';
import { useAuthStore } from '../../store/authStore';

export default function MemberManagementPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: membersData = [], isLoading } = useQuery({
    queryKey: ['admin-members'],
    queryFn: listUsersApi
  });

  const members = membersData.members || membersData || [];

  const filteredMembers = members.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

  const handleClose = () => {
    setSelectedMember(null);
  };

  if (user?.role !== 'ADMIN') {
    return (
      <PageWrapper>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-4">Access Denied</h2>
            <p className="text-red-600">Only administrators can access member management.</p>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Member Management</h1>
          <div className="text-sm text-slate-600">
            Manage team members and track their performance
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search members by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-slate-600">
              {filteredMembers.length} of {members.length} members
            </div>
          </div>
        </Card>

        {/* Member Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{members.length}</p>
              <p className="text-sm text-slate-500">Total Members</p>
            </div>
          </Card>
          <Card className="bg-white">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {members.filter(m => m.stats && m.stats.tasksAssigned > 0).length}
              </p>
              <p className="text-sm text-slate-500">Active Members</p>
            </div>
          </Card>
          <Card className="bg-white">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {members.filter(m => !m.stats || m.stats.tasksAssigned === 0).length}
              </p>
              <p className="text-sm text-slate-500">Inactive Members</p>
            </div>
          </Card>
          <Card className="bg-white">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {members.filter(m => m.stats && m.stats.overdue > 0).length}
              </p>
              <p className="text-sm text-slate-500">With Overdue Tasks</p>
            </div>
          </Card>
        </div>

        {/* Members List */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-slate-500">Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <Card className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 00-4 4v12a4 4 0 004 4h4a4 4 0 004-4v1.646a4 4 0 00-4 4v12a4 4 0 004-4z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No members found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm ? `No members found matching "${searchTerm}"` : 'No members in the system yet'}
            </p>
            <Button onClick={() => navigate('/projects')}>
              Create First Project
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <Card 
                key={member._id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleMemberClick(member)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-slate-600">
                        {member.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{member.name}</h3>
                      <p className="text-sm text-slate-500">{member.email}</p>
                      <Badge value={member.role} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      member.stats && member.stats.tasksAssigned > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.stats && member.stats.tasksAssigned > 0 ? 'Active' : 'Inactive'}
                    </span>
                    {member.stats && member.stats.overdue > 0 && (
                      <Badge value="OVERDUE" variant="danger" />
                    )}
                  </div>
                </div>

                <div className="text-sm text-slate-600">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="font-medium">Tasks Assigned:</span>
                    <span className="font-semibold">{member.stats?.tasksAssigned || 0}</span>
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="font-medium">Completed:</span>
                    <span className="font-semibold text-green-600">
                      {member.stats?.completed || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">Completion Rate:</span>
                    <span className="font-semibold">
                      {member.stats?.completionRate !== undefined 
                        ? `${member.stats.completionRate}%`
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Member Details Modal */}
        {selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Member Details</h2>
                <Button onClick={handleClose} variant="secondary" size="sm">
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Profile Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-slate-500">Name:</span>
                      <p className="font-medium">{selectedMember.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500">Email:</span>
                      <p className="font-medium">{selectedMember.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500">Role:</span>
                      <Badge value={selectedMember.role} />
                    </div>
                    <div>
                      <span className="text-sm text-slate-500">Member Since:</span>
                      <p className="font-medium">
                        {new Date(selectedMember.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Task Performance</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Total Tasks:</span>
                      <span className="font-semibold">{selectedMember.stats?.tasksAssigned || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Completed:</span>
                      <span className="font-semibold text-green-600">
                        {selectedMember.stats?.completed || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Completion Rate:</span>
                      <span className="font-semibold text-blue-600">
                        {selectedMember.stats?.completionRate !== undefined 
                          ? `${selectedMember.stats.completionRate}%`
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Overdue:</span>
                      <span className="font-semibold text-red-600">
                        {selectedMember.stats?.overdue || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
