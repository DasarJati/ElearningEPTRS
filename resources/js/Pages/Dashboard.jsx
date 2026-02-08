import DashboardLayout from '@/Layouts/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/Contexts/LanguageContext';


export default function Dashboard() {
  const { t, locale, translations } = useLanguage();
  const pageProps = usePage().props;
  const { student } = usePage().props;

  useEffect(() => {
    console.log('Current locale:', locale);
    console.log('Available translations:', translations);
    console.log('Test translation:', t('school'));
    console.log('Page props:', pageProps);
  }, [locale, translations, t, pageProps]); // Hanya log ketika dependencies ini berubah

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const { auth, profileData, courses, assignments, quizSessions, friends, pendingRequests } = usePage().props;
  const user = auth.user;

  const friendsData = friends || [];
  const friendRequestsData = pendingRequests || [];



  // Format time to MM:SS
  const formatTime = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Process quiz sessions data for leaderboard
  const processedLeaderboardData = quizSessions ? quizSessions.map((session, index) => ({
    rank: index + 1,
    name: session.display_name || 'Anonymous',
    school: session.school?.name || 'Unknown School',
    time: session.total_time_seconds || 0,
    avatar: (session.display_name || 'AN')
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2),
    isCurrentUser: session.user_id === user.id // Adjust based on your user identification
  })) : [];

  const initials = (profileData?.name || user.name)
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();


  // Handle accept friend request
  const handleAcceptRequest = (requestId) => {
    router.post(`/friends/accept-request/${requestId}`, {}, {
      preserveScroll: true,
      onSuccess: () => {
        // Refresh the page or update local state
        router.reload({ only: ['friends', 'pendingRequests'] });
      }
    });
  };

  // Handle reject friend request
  const handleRejectRequest = (requestId) => {
    router.post(`/friends/reject-request/${requestId}`, {}, {
      preserveScroll: true,
      onSuccess: () => {
        router.reload({ only: ['friends', 'pendingRequests'] });
      }
    });
  };

  const ActionCard = ({ icon, title, bgColor, iconBg }) => (
    <button
      className="
      flex items-center gap-3
      w-full
      bg-white
      rounded-2xl
      border border-gray-100
      shadow-sm
      px-4 py-3
      hover:shadow-md
      hover:-translate-y-0.5
      transition-all
      duration-200
    "
    >
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}
      >
        {icon}
      </div>

      {/* Text */}
      <span className="text-sm font-semibold text-gray-800">
        {title}
      </span>
    </button>
  );

  // Chat data class structure
  class Chat {
    constructor(id, name, avatar, avatarColor, lastMessage, lastMessageTime, status, subject, unreadCount = 0) {
      this.id = id;
      this.name = name;
      this.avatar = avatar;
      this.avatarColor = avatarColor;
      this.lastMessage = lastMessage;
      this.lastMessageTime = lastMessageTime;
      this.status = status; // 'online', 'away', 'offline'
      this.subject = subject;
      this.unreadCount = unreadCount;
    }

    get subjectBadge() {
      const subjects = {
        'Mathematics': { text: 'Mathematics', color: 'bg-blue-100 text-blue-800' },
        'Science': { text: 'Science', color: 'bg-purple-100 text-purple-800' },
        'History': { text: 'History', color: 'bg-yellow-100 text-yellow-800' },
        'English': { text: 'English', color: 'bg-green-100 text-green-800' },
        'Physics': { text: 'Physics', color: 'bg-red-100 text-red-800' }
      };
      return subjects[this.subject] || { text: this.subject, color: 'bg-gray-100 text-gray-800' };
    }

    get statusBadge() {
      const statuses = {
        'online': { text: 'Online', color: 'bg-green-100 text-green-800' },
        'away': { text: 'Away', color: 'bg-yellow-100 text-yellow-800' },
        'offline': { text: 'Offline', color: 'bg-gray-100 text-gray-800' }
      };
      return statuses[this.status] || statuses.offline;
    }
  }

  // Sample chat data using the class
  const chatData = [
    new Chat(
      1,
      'Ahmad Salleh',
      'AS',
      'bg-gradient-to-r from-blue-400 to-purple-500',
      'Hey, can you help me with the math assignment?',
      '2 min ago',
      'online',
      'Mathematics',
      2
    ),
    new Chat(
      2,
      'Nurul Huda',
      'NH',
      'bg-gradient-to-r from-pink-400 to-red-500',
      'I shared the science notes with you. Check your email!',
      '1 hr ago',
      'online',
      'Science',
      1
    ),
    new Chat(
      3,
      'Mohd Rizal',
      'MR',
      'bg-gradient-to-r from-green-400 to-teal-500',
      'Let\'s meet tomorrow for group study session',
      '3 hrs ago',
      'offline',
      'History',
      0
    )
  ];

  // Event handlers
  const handleChatClick = (chatId) => {
    console.log('Chat clicked:', chatId);
    // Navigate to chat or open chat modal
  };

  const handleNewChat = () => {
    console.log('Start new chat');
    // Open new chat modal or navigate to contacts
  };

  // Class structure for friends data
  class Friend {
    constructor(id, name, avatar, avatarColor, status, mutualFriends) {
      this.id = id;
      this.name = name;
      this.avatar = avatar;
      this.avatarColor = avatarColor;
      this.status = status;
      this.mutualFriends = mutualFriends;
    }
  }

  class FriendRequest {
    constructor(id, name, avatar, mutualFriends) {
      this.id = id;
      this.name = name;
      this.avatar = avatar;
      this.mutualFriends = mutualFriends;
    }
  }

  const filterButtons = [
    { id: 'all', label: 'All' },
    { id: 'bahasa', label: 'BM' },
    { id: 'english', label: 'English' },
    { id: 'matematik', label: 'Math' },
    { id: 'sejarah', label: 'History' },
    { id: 'sains', label: 'Science' }
  ];

  const teachersData = [
  {
    id: 1,
    name: 'Cikgu Aisyah',
    subject: 'Mathematics',
    avatar: 'A',
    color: 'bg-emerald-500',
  },
  {
    id: 2,
    name: 'Cikgu Farid',
    subject: 'Physics',
    avatar: 'F',
    color: 'bg-blue-500',
  },
  {
    id: 3,
    name: 'Cikgu Nurul',
    subject: 'Biology',
    avatar: 'N',
    color: 'bg-pink-500',
  },
  {
    id: 4,
    name: 'Cikgu Hakim',
    subject: 'Chemistry',
    avatar: 'H',
    color: 'bg-purple-500',
  },
];


  const filteredTeachers = activeFilter === 'all'
    ? teachersData
    : teachersData.filter(teacher =>
      teacher.subject.toLowerCase().includes(activeFilter.toLowerCase())
    );

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
  };

  const handleTeacherClick = (teacherId) => {
    console.log('Teacher clicked:', teacherId);
    // Navigate to teacher profile or open modal
  };

  return (

    <DashboardLayout>
      <Head title="Dashboard" />

      <div className="w-full flex justify-center">

      <div className="max-w-6xl px-4 py-4 xl:py-6 xl:px-12 lg:py-4 lg:px-4 flex justify-center w-full ">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-3 ">

          {/* Column 1 */}
          <div className="md:col-span-2 lg:col-span-3 xl:col-span-2">
            <div className="">
              {/* Profile Card */}
              <motion.div
                className="bg-gradient-to-br from-orange-400 via-orange-300 to-orange-500 rounded-2xl shadow-sm border border-gray-100 p-6 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-4 px-6" >
                  {/* Avatar */}
                  <div className="relative ">
                    <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-200">
                      {student?.profile_picture ? (
                        <img
                          src={`/storage/${student.profile_picture}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-xl">
                          {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                        </div>
                      )}
                    </div>


                  </div>

                  {/* Info */}
                  <div className="flex flex-col justify-center">
                    <h3 className="lg:text-xl text-2xl font-semibold text-gray-900">
                      {profileData?.name || user.name}
                    </h3>
                    <p className="lg:text-xl text-xl text-gray-600 leading-tight">
                      {profileData?.school || 'SMK GOMBAK SETIA'}
                    </p>
                    <p className="lg:text-xl text-xl text-gray-500">
                      {profileData?.grade || '5 Science 1'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 ">
                <ActionCard
                  title="Kawan PTRS"
                  iconBg="bg-green-200"
                  icon={
                    <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M18 9a3 3 0 11-6 0 3 3 0 016 0zM6 9a3 3 0 116 0 3 3 0 01-6 0zM6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                    </svg>
                  }
                />

                <ActionCard
                  title="Bincang Belajar"
                  iconBg="bg-pink-200"
                  icon={
                    <svg className="w-5 h-5 text-pink-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 20l1.2-3.6A7.84 7.84 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  }
                />

                <ActionCard
                  title="Kenali Guru PTRS"
                  iconBg="bg-yellow-200"
                  icon={
                    <svg className="w-5 h-5 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m-4-2h8" />
                    </svg>
                  }
                />
              </div> */}

              {/* <div className="grid grid-cols-2 gap-4 mb-4 h-56">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm col-span-1 flex flex-col">

                  <div className="px-4 py-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">
                      Online Friends
                    </h3>
                  </div>


                  <div className="px-3 pb-2 flex-1 overflow-y-auto scrollbar-thin space-y-1">
                    {friendsData.map((friend) => (
                      <div
                        key={friend.id}
                        className="
          flex items-center justify-between
          px-3 py-2
          rounded-xl
          hover:bg-gray-50
          transition
          group
        "
                      >
                        <div className="flex items-center gap-3">

                          <div className="relative">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold ${friend.avatarColor}`}>
                              {friend.avatar}
                            </div>
                            <span
                              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white
              ${friend.status === 'online'
                                  ? 'bg-green-400'
                                  : friend.status === 'away'
                                    ? 'bg-yellow-400'
                                    : 'bg-gray-300'}`}
                            />
                          </div>


                          <div>
                            <p className="text-sm font-medium text-gray-800 leading-none">
                              {friend.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {friend.mutualFriends} mutual
                            </p>
                          </div>
                        </div>


                        <button
                          onClick={() => router.get(route('chat.lobby'))}
                          className="
            text-xs font-medium
            text-blue-600
            opacity-0 group-hover:opacity-100
            transition
          "
                        >
                          Chat →
                        </button>
                      </div>
                    ))}
                  </div>


                  <div className="border-t border-gray-100">
                    <button
                      onClick={() => router.get(route('friends.index'))}
                      className="
        w-full
        py-2.5
        text-sm font-medium
        text-blue-600
        hover:bg-gray-50
        transition
      "
                    >
                      See all friends →
                    </button>
                  </div>
                </div>




                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm col-span-1 flex flex-col">

                  <div className="px-4 py-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">
                      Friend Requests
                    </h3>
                  </div>


                  <div className="px-3 pb-2 flex-1 overflow-y-auto scrollbar-thin space-y-2">
                    {friendRequestsData.map((request) => (
                      <div
                        key={request.id}
                        className="
          flex items-center justify-between
          px-3 py-2
          rounded-xl
          bg-gray-50
          hover:bg-gray-100
          transition
        "
                      >
                        <div className="flex items-center gap-3 min-w-0">

                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                            {request.avatar}
                          </div>


                          <div className="truncate">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {request.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {request.mutualFriends} mutual
                            </p>
                          </div>
                        </div>


                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="w-7 h-7 rounded-lg bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition"
                            title="Accept"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="w-7 h-7 rounded-lg bg-gray-300 text-white flex items-center justify-center hover:bg-gray-400 transition"
                            title="Reject"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}

                    {friendRequestsData.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-xs text-gray-400">
                          No pending requests
                        </p>
                      </div>
                    )}
                  </div>


                  {friendRequestsData.length > 0 && (
                    <div className="border-t border-gray-100">
                      <button
                        onClick={() => router.get(route('friends.requests'))}
                        className="
          w-full
          py-2.5
          text-sm font-medium
          text-blue-600
          hover:bg-gray-50
          transition
        "
                      >
                        See all requests →
                      </button>
                    </div>
                  )}
                </div>



              </div> */}

            </div>

            {assignments && assignments.map((assignment, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4 mb-2 sm:mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h3 className="font-semibold text-base sm:text-lg mb-2">{assignment.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-2">{assignment.dueDate}</p>
                <div className="pl-2 border-l-4 border-blue-500">
                  <p className="font-medium text-sm sm:text-base">{assignment.topic}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{assignment.description}</p>
                </div>
              </motion.div>
            ))}

            {/* My Courses Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-100 mb-2"
            >
              <h2 className="text-sm font-bold mb-4 px-3 sm:px-4 pt-3 pb-2 border-b border-grey">{t('my_courses', 'My Courses')}</h2>

              <div className="grid grid-cols-1 gap-3 p-3 max-h-[350px] sm:max-h-[150px] overflow-y-auto">
                {courses && courses.map((course, index) => (
                  <div
                    key={index}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`bg-white rounded-xl shadow p-3 sm:p-4 transform transition duration-300 ${hoveredIndex === index ? "scale-[1.02] shadow-md" : ""
                      }`}
                  >
                    <h3 className="font-semibold text-sm sm:text-base">{course.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-2">Up First: {course.topic}</p>
                    {course.total && (
                      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                        <div
                          className="bg-blue-600 h-2 sm:h-2.5 rounded-full"
                          style={{ width: `${(course.progress / course.total) * 100}%` }}
                        ></div>
                      </div>
                    )}
                    {course.total && (
                      <p className="text-xs text-gray-500 mt-1">
                        {course.progress} / {course.total} exercises complete
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Chat List Card */}

          </div>

           <div className="md:col-span-2 lg:col-span-2 xl:col-span-1">
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
    
    {/* Header */}
    <div className="px-4 py-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase">
        Kenali Cikgu PTRS
      </h3>
    </div>

    {/* List */}
    <div className="px-3 pb-2 flex-1 overflow-y-auto scrollbar-thin space-y-2">
      {teachersData.map((teacher) => (
        <div
          key={teacher.id}
          className="
            flex items-center justify-between
            px-3 py-2
            rounded-xl
            hover:bg-gray-50
            transition
            group
          "
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-xl ${teacher.color} flex items-center justify-center text-white font-semibold`}>
              {teacher.avatar}
            </div>

            {/* Info */}
            <div className="truncate">
              <p className="text-sm font-medium text-gray-800 truncate">
                {teacher.name}
              </p>
              <p className="text-xs text-gray-500">
                {teacher.subject}
              </p>
            </div>
          </div>

          {/* Action */}
          <button
            className="
              text-xs font-medium
              text-blue-600
              opacity-0 group-hover:opacity-100
              transition
            "
          >
            View →
          </button>
        </div>
      ))}
    </div>

    {/* Footer */}
    <div className="border-t border-gray-100">
      <button
        className="
          w-full
          py-2.5
          text-sm font-medium
          text-blue-600
          hover:bg-gray-50
          transition
        "
      >
        See all teachers →
      </button>
    </div>

  </div>
</div>


          {/* Column 2 - Assignments and Courses */}
          {/* <div className="md:col-span-2 lg:col-span-2 xl:col-span-1">
            <div className='relative mb-2'>
              
              <div
                className="absolute inset-0 bg-cover bg-top bg-no-repeat z-0 rounded-lg"
                style={{ backgroundImage: 'url(/images/bg_leaderboard.jpg)' }}
              />
              <div className="relative z-10">
                <motion.div
                  className="rounded-none shadow-sm overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  
                  <div className="px-2 sm:px-3 pt-3 sm:pt-4">
                    <div className="flex flex-col items-center justify-center space-y-1 sm:space-y-2">
                      <img
                        src="/images/child_celeb.png"
                        alt="Leaderboard"
                        className="h-32 sm:h-40 md:h-48 w-auto object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <h2 className="lg:text-xl text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 bg-gray-100 rounded-t-xl border-b-2 py-2 sm:py-3 flex items-center justify-center">
                      {t('leaderboard', 'Leaderboard')}
                    </h2>
                  </div>

                 
                  <div className="px-2 sm:px-3 pb-2 sm:pb-3 rounded-xl">
                    {processedLeaderboardData.length > 0 ? (
                      <div className="space-y-1 sm:space-y-2">
                        
                        <div className="grid grid-cols-12 gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 bg-gray-100 rounded-b-xl text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                          <div className="col-span-1 text-center text-xs">{t('rank', 'Rank')}</div>
                          <div className="col-span-4 text-xs lg:ms-2"></div>
                          <div className="col-span-5 text-xs">{t('school', 'School')}</div>
                          <div className="col-span-2 text-right text-xs">{t('time', 'Time')}</div>
                        </div>

                        
                        <div className="space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200 max-h-[400px] sm:max-h-[350px] md:max-h-[500px] xl:max-h-[600px]">
                          {processedLeaderboardData.map((user) => (
                            <div
                              key={user.rank}
                              className={`grid grid-cols-12 gap-1 sm:gap-2 items-center p-2 sm:p-3 rounded-lg ${user.isCurrentUser ? "bg-blue-50 border border-blue-100" : "bg-gray-50"
                                }`}
                            >
                             
                              <div className="col-span-1 flex justify-center">
                                <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium relative ${user.rank === 1 ? "bg-yellow-500 shadow-lg" :
                                  user.rank === 2 ? "bg-gray-400 shadow-md" :
                                    user.rank === 3 ? "bg-orange-500 shadow-md" : "bg-gray-600"
                                  }`}>
                                  {user.rank <= 3 ? (
                                    <span className="text-xs font-bold">
                                      {user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : "🥉"}
                                    </span>
                                  ) : (
                                    user.rank
                                  )}
                                </div>
                              </div>

                              
                              <div className="col-span-4 min-w-0">
                                <div className="flex items-center">
                                  <p className={`text-xs font-bold truncate ${user.isCurrentUser ? "text-blue-700" : "text-gray-800"}`}>
                                    {user.name}
                                  </p>
                                </div>
                              </div>

                              
                              <div className="col-span-5 min-w-0">
                                <p className="text-xs text-gray-600 font-bold overflow-hidden"
                                  style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                  }}>
                                  {user.school}
                                </p>
                              </div>

                              
                              <div className="col-span-2 text-right">
                                <p className="text-xs font-semibold text-gray-500">
                                  {formatTime(user.time)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8">
                        <p className="text-gray-500 text-sm sm:text-base">No quiz data available yet</p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">Take a quiz to appear on the leaderboard!</p>
                      </div>
                    )}
                  </div>

                  
                  <div className="p-3 border-t-4 border-gray-100 bg-transparent opacity-90 rounded-b-md">
                    <button
                      onClick={() => router.visit(route('quiz-page'))}
                      className="w-full text-center py-1.5 text-gray-50 hover:text-purple-700 text-sm font-medium transition duration-200">
                      View All Leaderboard
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>

           
            <div className="lg:col-span-2 xl:col-span-2">
              <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                
                <div className="p-3 border-b border-gray-100">
                  <h2 className="text-base font-semibold text-gray-800">Cikgu PTRS</h2>
                </div>

                
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex flex-wrap gap-1.5">
                    {filterButtons.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => handleFilterChange(filter.id)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${activeFilter === filter.id
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

               
                <div className="max-h-72 overflow-y-auto">
                  <div className="divide-y divide-gray-100">
                    {filteredTeachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleTeacherClick(teacher.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm ${teacher.avatarColor} shadow-sm`}>
                            {teacher.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-gray-800 truncate">{teacher.name}</h3>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${teacher.status === 'online'
                                ? 'text-green-600 bg-green-50'
                                : 'text-gray-500 bg-gray-100'
                                }`}>
                                {teacher.status === 'online' ? 'Online' : 'Offline'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5">{teacher.subject}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500 truncate">{teacher.school}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">{teacher.experience}y exp</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

        
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => router.visit(route('quiz-page'))}
                    className="w-full text-center py-1.5 text-blue-600 hover:text-blue-700 text-xs font-medium transition duration-200">
                    View All Teachers →
                  </button>
                </div>
              </motion.div>
            </div>
          </div> */}

          {/* Column 3 - Leaderboard - Table Version */}
          <div className="lg:col-span-3 xl:col-span-4 relative">

          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>

  );
}