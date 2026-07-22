import { useEffect, useRef, useState } from 'react';
import SubjectLayout from '@/Layouts/SubjectLayout';
import { Head, router, usePage } from '@inertiajs/react';
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  PlayIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function SubjectPage({ selectedStandard }) {
  const { props } = usePage();
  const {
    subject,
    subject_abbr,
    content,
    form,
    subject_id,
    level_id,
    availableLevels,
    availableSubjects,
  } = props;

  const [currentStandard, setCurrentStandard] = useState(selectedStandard || form || 'Form 4');
  const [activeSection, setActiveSection] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const sectionRefs = useRef({});
  const currentContent = content || { id: 0, sections: [] };
  const sections = currentContent.sections || [];

  useEffect(() => {
    if (sections.length && !activeSection) setActiveSection(sections[0].title);
  }, [sections, activeSection]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActiveSection(visible[0].target.id);
    }, { rootMargin: '-35% 0px -50% 0px', threshold: [0.1, 0.4, 0.7] });
    sections.forEach((section) => sectionRefs.current[section.title] && observer.observe(sectionRefs.current[section.title]));
    return () => observer.disconnect();
  }, [sections]);

  const handleStandardChange = (standard) => {
    setCurrentStandard(standard);
    router.get(route('subject-page', {
      subject: subject_abbr || subject,
      form: standard,
      level_id: availableLevels?.[standard] || level_id,
      subject_id: availableSubjects?.[standard] || subject_id,
    }));
  };

  const scrollToSection = (title) => {
    setActiveSection(title);
    const element = document.getElementById(title);
    if (element) window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 145, behavior: 'smooth' });
  };

  const getVideoInfo = (url) => {
    if (!url) return { platform: 'video', thumbnail: null, embedUrl: null };
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
      const videoId = match?.[2]?.length === 11 ? match[2] : null;
      return { platform: 'youtube', thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null, embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : url };
    }
    return { platform: 'video', thumbnail: null, embedUrl: url };
  };

  const startPractice = (routeName, section, subSection) => {
    router.get(route(routeName), {
      subject,
      standard: currentStandard,
      sectionId: section.id,
      sectionTitle: section.title,
      contentId: currentContent.id,
      topic: subSection.title,
      topic_id: subSection.id,
      subject_id,
      level_id,
    });
  };

  const totalLessons = sections.reduce((sum, section) => sum + (section.subSections?.length || 0), 0);
  const completedLessons = sections.reduce((sum, section) => sum + (section.subSections || []).filter((item) => item.lastPractice?.objective?.score >= 70 || item.lastPractice?.subjective?.score >= 70).length, 0);
  const progress = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

  if (!content) {
    return <SubjectLayout subject={subject} selectedStandard={currentStandard}><div className="mx-auto max-w-[1440px] px-4 py-20 text-center text-sm text-slate-500">Loading course content…</div></SubjectLayout>;
  }

  return (
    <SubjectLayout subject={subject} onStandardChange={handleStandardChange} selectedStandard={currentStandard} availableLevels={availableLevels}>
      <Head title={`${subject} Course`} />
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600"><BookOpenIcon className="h-5 w-5" /></span><div><p className="text-xs font-medium text-slate-400">Course sections</p><p className="mt-0.5 text-lg font-semibold text-slate-900">{sections.length}</p></div></div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-cyan-50 p-2.5 text-cyan-600"><DocumentTextIcon className="h-5 w-5" /></span><div><p className="text-xs font-medium text-slate-400">Learning modules</p><p className="mt-0.5 text-lg font-semibold text-slate-900">{totalLessons}</p></div></div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600"><CheckCircleIcon className="h-5 w-5" /></span><div><p className="text-xs font-medium text-slate-400">Course progress</p><p className="mt-0.5 text-lg font-semibold text-slate-900">{progress}%</p></div></div><div className="h-10 w-10 rounded-full border-4 border-emerald-100 border-t-emerald-500" /></div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="h-fit lg:sticky lg:top-[145px]">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Course contents</p>
                <p className="mt-1 text-sm text-slate-500">Jump to a section</p>
              </div>
              <nav className="max-h-[520px] space-y-1 overflow-y-auto p-2">
                {sections.map((section, index) => (
                  <button key={section.id} onClick={() => scrollToSection(section.title)} className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${activeSection === section.title ? 'bg-indigo-50 font-semibold text-indigo-700' : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                    <span className={`flex h-6 w-6 flex-none items-center justify-center rounded-lg text-[10px] font-bold ${activeSection === section.title ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{String(index + 1).padStart(2, '0')}</span>
                    <span className="line-clamp-2 leading-6">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <div className="space-y-6">
            {!sections.length ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><BookOpenIcon className="mx-auto h-9 w-9 text-slate-300" /><p className="mt-3 text-sm font-medium text-slate-600">No course modules are available yet.</p></div>
            ) : sections.map((section, sectionIndex) => (
              <section key={section.id} id={section.title} ref={(element) => { sectionRefs.current[section.title] = element; }} className="scroll-mt-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <header className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">{String(sectionIndex + 1).padStart(2, '0')}</span>
                    <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-500">Section {sectionIndex + 1}</p><h2 className="mt-1 text-lg font-semibold text-slate-900">{section.title}</h2></div>
                  </div>
                  <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{section.subSections?.length || 0} modules</span>
                </header>

                <div className="divide-y divide-slate-100">
                  {(section.subSections || []).map((subSection, moduleIndex) => {
                    const objectiveCompleted = subSection.lastPractice?.objective?.score >= 70;
                    const subjectiveCompleted = subSection.lastPractice?.subjective?.score >= 70;
                    const completed = objectiveCompleted || subjectiveCompleted;
                    return (
                      <article key={subSection.id} className="p-5 sm:p-6">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div className="flex items-start gap-3">
                            <span className={`mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg ${completed ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{completed ? <CheckCircleIcon className="h-5 w-5" /> : <span className="text-xs font-bold">{moduleIndex + 1}</span>}</span>
                            <div><h3 className="font-semibold text-slate-900">{subSection.title}</h3><p className="mt-1 text-xs text-slate-400">{subSection.questionCounts?.objective || 0} objective · {subSection.questionCounts?.subjective || 0} written questions</p></div>
                          </div>
                          {completed && <span className="w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Completed</span>}
                        </div>

                        <div className="mt-5 grid gap-4 xl:grid-cols-2">
                          <div>
                            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Practice</p>
                            <div className="space-y-3">
                              {subSection.questionCounts?.objective > 0 && (
                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-indigo-200 hover:bg-white hover:shadow-sm">
                                  <div className="flex gap-3"><span className="h-fit rounded-lg bg-indigo-50 p-2 text-indigo-600"><DocumentTextIcon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-slate-800">Objective practice</p><span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">{subSection.questionCounts.objective} questions</span></div><p className="mt-1 text-xs text-slate-500">{subSection.practiceTitle || 'Test your understanding of this topic.'}</p><div className="mt-3 flex items-center justify-between"><button onClick={() => startPractice('objective-page', section, subSection)} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700">{objectiveCompleted ? 'Try again' : 'Start practice'}<ArrowRightIcon className="h-3.5 w-3.5" /></button>{subSection.lastPractice?.objective && <span className="text-xs font-semibold text-slate-500">Last: {subSection.lastPractice.objective.score}%</span>}</div></div></div>
                                </div>
                              )}
                              {subSection.questionCounts?.subjective > 0 && (
                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-violet-200 hover:bg-white hover:shadow-sm">
                                  <div className="flex gap-3"><span className="h-fit rounded-lg bg-violet-50 p-2 text-violet-600"><PencilSquareIcon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-slate-800">Written practice</p><span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-600">{subSection.questionCounts.subjective} questions</span></div><p className="mt-1 text-xs text-slate-500">Build a stronger written response.</p><button onClick={() => startPractice('subjective-page', section, subSection)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-violet-700">{subjectiveCompleted ? 'Try again' : 'Start writing'}<ArrowRightIcon className="h-3.5 w-3.5" /></button></div></div>
                                </div>
                              )}
                              {!subSection.questionCounts?.objective && !subSection.questionCounts?.subjective && <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">Practice content is coming soon.</div>}
                            </div>
                          </div>

                          <div>
                            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Video lessons</p>
                            <div className="space-y-2">
                              {(subSection.videos || []).map((video, index) => {
                                const videoInfo = getVideoInfo(video.url);
                                return (
                                  <button key={index} onClick={() => setSelectedVideo({ ...video, ...videoInfo })} className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 p-2.5 text-left transition hover:border-cyan-200 hover:bg-cyan-50/30">
                                    <span className="relative flex h-14 w-20 flex-none items-center justify-center overflow-hidden rounded-lg bg-slate-100">{videoInfo.thumbnail ? <img src={videoInfo.thumbnail} alt="" className="h-full w-full object-cover transition group-hover:scale-105" /> : <PlayIcon className="h-5 w-5 text-slate-400" />}<span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 transition group-hover:bg-slate-950/20"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 opacity-0 shadow transition group-hover:opacity-100"><PlayIcon className="ml-0.5 h-3.5 w-3.5 text-slate-900" /></span></span></span>
                                    <span className="min-w-0 flex-1"><span className="line-clamp-2 text-sm font-semibold text-slate-700">{video.title}</span><span className="mt-1 flex items-center gap-1 text-[10px] text-slate-400"><ClockIcon className="h-3 w-3" /> Video lesson</span></span><ArrowRightIcon className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-cyan-600" />
                                  </button>
                                );
                              })}
                              {!subSection.videos?.length && <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center"><PlayIcon className="mx-auto h-5 w-5 text-slate-300" /><p className="mt-2 text-xs text-slate-400">No video lessons yet.</p></div>}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
                <footer className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6"><span className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><SparklesIcon className="h-4 w-4 text-indigo-500" /> Section progress</span><div className="flex items-center gap-3"><div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-3/5 rounded-full bg-indigo-500" /></div><span className="text-xs font-semibold text-slate-600">60%</span></div></footer>
              </section>
            ))}
          </div>
        </div>
      </div>

      {selectedVideo && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" onClick={() => setSelectedVideo(null)}>
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><p className="font-semibold text-slate-900">{selectedVideo.title}</p><p className="mt-0.5 text-xs text-slate-400">Video lesson</p></div><button onClick={() => setSelectedVideo(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><XMarkIcon className="h-5 w-5" /></button></div>
            <div className="relative bg-slate-950 pt-[56.25%]">{selectedVideo.platform === 'youtube' ? <iframe src={`${selectedVideo.embedUrl}?autoplay=1&rel=0`} className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={selectedVideo.title} /> : <video controls autoPlay className="absolute inset-0 h-full w-full"><source src={selectedVideo.embedUrl} type="video/mp4" /></video>}</div>
          </div>
        </div>
      )}
    </SubjectLayout>
  );
}
