-- ============================================================
-- IELTSwithKaif — seed.sql
-- Adds the original starter content to your EXISTING database.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to run again: rows use fixed IDs and duplicates are skipped.
-- Contents: 9 categories, 4 tests, 40 questions, 3 lessons,
--           4 writing tasks, 8 speaking topics, homepage settings.
-- ============================================================

insert into public.categories (id, kind, name) values
  ('c0000000-0000-4000-8000-000000000001', 'reading', 'Academic'),
  ('c0000000-0000-4000-8000-000000000002', 'reading', 'General Training'),
  ('c0000000-0000-4000-8000-000000000003', 'reading', 'History'),
  ('c0000000-0000-4000-8000-000000000004', 'reading', 'Environment'),
  ('c0000000-0000-4000-8000-000000000005', 'listening', 'Daily Life'),
  ('c0000000-0000-4000-8000-000000000006', 'listening', 'Education'),
  ('c0000000-0000-4000-8000-000000000007', 'lesson', 'Reading Skills'),
  ('c0000000-0000-4000-8000-000000000008', 'lesson', 'Listening Skills'),
  ('c0000000-0000-4000-8000-000000000009', 'lesson', 'Band Scores')
on conflict (id) do nothing;

insert into public.tests (id, skill, title, category, level, time_minutes, passage, audio_url, image_url, published) values
  ('a0000000-0000-4000-8000-000000000001', 'reading', 'Reading Test 1 — The Story of the Bicycle', 'History', 'All levels', 15, 'The bicycle is such a familiar sight today that it is easy to forget how strange the first versions looked. In 1817, a German inventor named Karl Drais built a wooden machine with two wheels in a line and no pedals at all. The rider sat on it and pushed along the ground with his feet, rather like a child on a balance bike today. Drais called it the "running machine", and it could reach speeds of about 15 kilometres per hour on flat roads.

The next big step came in the 1860s in France, when pedals were attached directly to the front wheel. This design, nicknamed the "boneshaker" because of its iron frame and wooden wheels, was heavy and uncomfortable, but it was the first bicycle that could be ridden without touching the ground. Cycling quickly became fashionable, and manufacturers searched for ways to make the machines faster.

Their answer was the "penny-farthing" of the 1870s, which had an enormous front wheel — sometimes 1.5 metres across — and a tiny back wheel. Because the pedals turned the front wheel directly, a bigger wheel meant a higher speed. However, the penny-farthing was dangerous: riders sat high above the ground, and a sudden stop could throw them over the handlebars.

The modern bicycle finally appeared in 1885, when John Kemp Starley produced the "Rover Safety Bicycle" in England. It had two wheels of almost equal size, pedals in the middle, and a chain that drove the rear wheel. This arrangement was far more stable, and it allowed the rider''s feet to reach the ground. Within a few years, the addition of rubber tyres filled with air made cycling comfortable as well as safe.

The effects reached far beyond transport. In the 1890s, cycling gave many women a new sense of freedom, because a bicycle let them travel alone without a horse or a companion. Some historians argue that the bicycle did more to change women''s lives in that decade than any political campaign. Today, more than a billion bicycles are in use around the world, and in cities from Amsterdam to Beijing they remain one of the cleanest and cheapest ways to travel.', '', '', true),
  ('a0000000-0000-4000-8000-000000000002', 'reading', 'Reading Test 2 — Why Cities Need Urban Gardens', 'Environment', 'All levels', 15, 'Paragraph A
In the world''s fastest-growing cities, green space is disappearing. Apartment blocks rise where fields once stood, and many urban families live far from any park. In response, residents have begun turning empty land, rooftops and even old car parks into community gardens. What began as a hobby for a few neighbours has become a serious movement with measurable benefits.

Paragraph B
The most obvious benefit is food. A community plot of only 100 square metres can produce over 200 kilograms of vegetables in a year. For low-income families, this fresh produce reduces weekly shopping bills. Just as importantly, food grown a short walk from home does not need lorries, packaging or refrigeration, so its carbon footprint is tiny compared with supermarket vegetables flown in from abroad.

Paragraph C
Gardens also cool the city. Plants release water vapour through their leaves, and soil absorbs heat that concrete would reflect back into the air. Studies in several hot cities have found that neighbourhoods with community gardens can be up to two degrees cooler on summer nights than similar areas without them. At a time of rising temperatures, this difference protects elderly residents, who are most at risk during heatwaves.

Paragraph D
Perhaps the greatest benefit, however, is social. A garden gives strangers a reason to meet, cooperate and share skills. Older gardeners teach teenagers how to plant seeds; new arrivals to a city practise the local language while they work. Several cities now report that neighbourhoods with active gardens also enjoy lower levels of petty crime, because residents know and look out for one another.

Paragraph E
None of this means gardens are simple. Land in cities is expensive, and gardeners often depend on short leases that a landowner can end at any time. Water can also be a problem in dry regions. Supporters argue that city councils should protect established gardens in law, the way they protect parks, so that years of work cannot be destroyed by a single building project.', '', '', true),
  ('a0000000-0000-4000-8000-000000000003', 'listening', 'Listening Test 1 — Joining the City Library', 'Daily Life', 'All levels', 12, 'You will hear a conversation between a student and a librarian at a city library. Listen and answer questions 1–10. In the real IELTS test, the recording is played once.', 'audio/listening1.mp3', '', true),
  ('a0000000-0000-4000-8000-000000000004', 'listening', 'Listening Test 2 — Sleep and Study (Lecture)', 'Education', 'All levels', 12, 'You will hear a university lecturer talking about sleep and learning. Listen and answer questions 1–10. In the real IELTS test, the recording is played once.', 'audio/listening2.mp3', '', true)
on conflict (id) do nothing;

insert into public.questions (id, test_id, position, qtype, prompt, options, answer, explanation) values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 0, 'mcq', 'How did riders move the first bicycle built by Karl Drais?', '["By turning pedals attached to the front wheel","By pushing along the ground with their feet","By using a chain connected to the rear wheel","By pulling a lever with their hands"]'::jsonb, 'By pushing along the ground with their feet', 'The passage says the rider ''pushed along the ground with his feet'' because the machine had no pedals.'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 1, 'mcq', 'Why was the French design of the 1860s called the ''boneshaker''?', '["Because it made a loud noise","Because its engine shook the frame","Because its iron frame and wooden wheels made it uncomfortable","Because riders often fell off it"]'::jsonb, 'Because its iron frame and wooden wheels made it uncomfortable', 'The text states it was nicknamed the boneshaker ''because of its iron frame and wooden wheels'' and was ''heavy and uncomfortable''.'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 2, 'mcq', 'What was the main advantage of a larger front wheel on the penny-farthing?', '["It made the bicycle cheaper","It made the bicycle faster","It made stopping safer","It made the seat more comfortable"]'::jsonb, 'It made the bicycle faster', '''Because the pedals turned the front wheel directly, a bigger wheel meant a higher speed.'''),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 3, 'mcq', 'Which feature appeared on John Kemp Starley''s 1885 bicycle?', '["Electric motor","Air-filled tyres as standard","A chain driving the rear wheel","Three wheels for stability"]'::jsonb, 'A chain driving the rear wheel', 'The Rover Safety Bicycle had ''a chain that drove the rear wheel''. Air-filled tyres came a few years later.'),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 4, 'tfng', 'Karl Drais built his running machine in 1817.', '["True","False","Not Given"]'::jsonb, 'True', '''In 1817, a German inventor named Karl Drais built a wooden machine...'''),
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', 5, 'tfng', 'The penny-farthing was safer than earlier bicycles.', '["True","False","Not Given"]'::jsonb, 'False', 'The passage says the penny-farthing ''was dangerous'' and riders could be thrown over the handlebars.'),
  ('b0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000001', 6, 'tfng', 'Karl Drais sold more than a million running machines.', '["True","False","Not Given"]'::jsonb, 'Not Given', 'The passage gives no information about sales figures for the running machine.'),
  ('b0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000001', 7, 'fill', 'The running machine could travel at about ______ kilometres per hour on flat roads. (Write a number.)', '[]'::jsonb, '15', 'The text says it ''could reach speeds of about 15 kilometres per hour''.'),
  ('b0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000001', 8, 'fill', 'On a penny-farthing, the front wheel could be up to ______ metres across. (Write a number.)', '[]'::jsonb, '1.5', 'The front wheel was ''sometimes 1.5 metres across''.'),
  ('b0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000001', 9, 'fill', 'According to some historians, in the 1890s the bicycle gave many ______ a new sense of freedom. (One word.)', '[]'::jsonb, 'women', '''Cycling gave many women a new sense of freedom.'''),
  ('b0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000002', 0, 'match', 'Which paragraph (A–E) explains how gardens can reduce temperatures?', '["A","B","C","D","E"]'::jsonb, 'C', 'Paragraph C describes how plants and soil cool the city, with neighbourhoods ''up to two degrees cooler''.'),
  ('b0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000002', 1, 'match', 'Which paragraph (A–E) describes a risk that gardens may be closed down?', '["A","B","C","D","E"]'::jsonb, 'E', 'Paragraph E explains that gardeners depend on short leases ''that a landowner can end at any time''.'),
  ('b0000000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000002', 2, 'match', 'Which paragraph (A–E) mentions gardens helping people who have recently moved to a city?', '["A","B","C","D","E"]'::jsonb, 'D', 'Paragraph D says ''new arrivals to a city practise the local language while they work''.'),
  ('b0000000-0000-4000-8000-000000000014', 'a0000000-0000-4000-8000-000000000002', 3, 'mcq', 'According to Paragraph B, a 100-square-metre plot can produce how many vegetables per year?', '["About 20 kilograms","About 100 kilograms","Over 200 kilograms","Over 2,000 kilograms"]'::jsonb, 'Over 200 kilograms', '''A community plot of only 100 square metres can produce over 200 kilograms of vegetables in a year.'''),
  ('b0000000-0000-4000-8000-000000000015', 'a0000000-0000-4000-8000-000000000002', 4, 'mcq', 'Why does locally grown food have a small carbon footprint?', '["It is grown without soil","It needs no transport, packaging or cold storage","Supermarkets pay extra for it","It grows faster than imported food"]'::jsonb, 'It needs no transport, packaging or cold storage', 'The passage says it ''does not need lorries, packaging or refrigeration''.'),
  ('b0000000-0000-4000-8000-000000000016', 'a0000000-0000-4000-8000-000000000002', 5, 'mcq', 'Which group benefits most from cooler summer nights, according to Paragraph C?', '["Teenagers","Gardeners","Shop owners","Elderly residents"]'::jsonb, 'Elderly residents', '''This difference protects elderly residents, who are most at risk during heatwaves.'''),
  ('b0000000-0000-4000-8000-000000000017', 'a0000000-0000-4000-8000-000000000002', 6, 'mcq', 'What do supporters want city councils to do?', '["Pay gardeners a salary","Protect gardens in law like parks","Build gardens on rooftops only","Ban supermarket vegetables"]'::jsonb, 'Protect gardens in law like parks', 'Supporters argue councils ''should protect established gardens in law, the way they protect parks''.'),
  ('b0000000-0000-4000-8000-000000000018', 'a0000000-0000-4000-8000-000000000002', 7, 'fill', 'Garden neighbourhoods can be up to ______ degrees cooler on summer nights. (Write a number.)', '[]'::jsonb, 'two|2', '''Up to two degrees cooler'' — both ''two'' and ''2'' are accepted.'),
  ('b0000000-0000-4000-8000-000000000019', 'a0000000-0000-4000-8000-000000000002', 8, 'fill', 'In Paragraph D, older gardeners teach ______ how to plant seeds. (One word.)', '[]'::jsonb, 'teenagers', '''Older gardeners teach teenagers how to plant seeds.'''),
  ('b0000000-0000-4000-8000-000000000020', 'a0000000-0000-4000-8000-000000000002', 9, 'fill', 'One difficulty mentioned in Paragraph E is that urban ______ is expensive. (One word.)', '[]'::jsonb, 'land', '''Land in cities is expensive.'''),
  ('b0000000-0000-4000-8000-000000000021', 'a0000000-0000-4000-8000-000000000003', 0, 'fill', 'The student''s surname is ______.', '[]'::jsonb, 'kaif', 'The student spells his surname: K-A-I-F.'),
  ('b0000000-0000-4000-8000-000000000022', 'a0000000-0000-4000-8000-000000000003', 1, 'fill', 'The student lives at 24 ______ Street.', '[]'::jsonb, 'maple', 'He says: ''24 Maple Street''.'),
  ('b0000000-0000-4000-8000-000000000023', 'a0000000-0000-4000-8000-000000000003', 2, 'fill', 'To join, the student must show a passport and a ______ bill.', '[]'::jsonb, 'electricity', 'The librarian asks for ''a passport and a recent electricity bill''.'),
  ('b0000000-0000-4000-8000-000000000024', 'a0000000-0000-4000-8000-000000000003', 3, 'mcq', 'How many books can a member borrow at one time?', '["Four","Six","Eight","Ten"]'::jsonb, 'Eight', '''You can borrow up to eight books at a time.'''),
  ('b0000000-0000-4000-8000-000000000025', 'a0000000-0000-4000-8000-000000000003', 4, 'mcq', 'How long is the standard loan period?', '["One week","Two weeks","Three weeks","Four weeks"]'::jsonb, 'Three weeks', '''The loan period is three weeks.'''),
  ('b0000000-0000-4000-8000-000000000026', 'a0000000-0000-4000-8000-000000000003', 5, 'fill', 'The late fee is ______ pence per day for each book.', '[]'::jsonb, '30|thirty', '''The charge is thirty pence per day.'''),
  ('b0000000-0000-4000-8000-000000000027', 'a0000000-0000-4000-8000-000000000003', 6, 'mcq', 'When does the library close on Saturdays?', '["At 4 pm","At 5 pm","At 6 pm","At 8 pm"]'::jsonb, 'At 5 pm', '''On Saturdays we close earlier, at five.'''),
  ('b0000000-0000-4000-8000-000000000028', 'a0000000-0000-4000-8000-000000000003', 7, 'fill', 'The computer room is on the ______ floor.', '[]'::jsonb, 'second', '''The computer room is upstairs, on the second floor.'''),
  ('b0000000-0000-4000-8000-000000000029', 'a0000000-0000-4000-8000-000000000003', 8, 'mcq', 'What must the student book in advance?', '["A study desk","A computer","A meeting room","A locker"]'::jsonb, 'A computer', '''You need to book a computer in advance — they are very popular.'''),
  ('b0000000-0000-4000-8000-000000000030', 'a0000000-0000-4000-8000-000000000003', 9, 'fill', 'The student''s membership number will be sent by ______.', '[]'::jsonb, 'email', '''We will email your membership number this afternoon.'''),
  ('b0000000-0000-4000-8000-000000000031', 'a0000000-0000-4000-8000-000000000004', 0, 'mcq', 'According to the lecturer, most adults need how much sleep each night?', '["Five to six hours","Six to seven hours","Seven to nine hours","Nine to ten hours"]'::jsonb, 'Seven to nine hours', '''Most adults need between seven and nine hours of sleep.'''),
  ('b0000000-0000-4000-8000-000000000032', 'a0000000-0000-4000-8000-000000000004', 1, 'mcq', 'What happens to memories during deep sleep?', '["They are forgotten","They move to long-term storage","They become clearer images","They are replaced by dreams"]'::jsonb, 'They move to long-term storage', 'During deep sleep the brain ''moves new memories into long-term storage''.'),
  ('b0000000-0000-4000-8000-000000000033', 'a0000000-0000-4000-8000-000000000004', 2, 'fill', 'Students who slept well remembered ______ percent more words in the experiment.', '[]'::jsonb, '20|twenty', '''The well-rested group remembered twenty percent more words.'''),
  ('b0000000-0000-4000-8000-000000000034', 'a0000000-0000-4000-8000-000000000004', 3, 'mcq', 'The lecturer compares an all-night study session to:', '["Running a marathon","Saving money in a bank","Writing on wet sand","Charging a phone"]'::jsonb, 'Writing on wet sand', '''It is like writing on wet sand — by morning, most of it has washed away.'''),
  ('b0000000-0000-4000-8000-000000000035', 'a0000000-0000-4000-8000-000000000004', 4, 'fill', 'A short nap of about ______ minutes can improve concentration.', '[]'::jsonb, '20|twenty', '''A nap of about twenty minutes can refresh concentration.'''),
  ('b0000000-0000-4000-8000-000000000036', 'a0000000-0000-4000-8000-000000000004', 5, 'mcq', 'Why should students avoid phones before bed?', '["They are noisy","Their light reduces sleep quality","They use too much electricity","They cause headaches"]'::jsonb, 'Their light reduces sleep quality', '''The light from screens tells the brain to stay awake and reduces sleep quality.'''),
  ('b0000000-0000-4000-8000-000000000037', 'a0000000-0000-4000-8000-000000000004', 6, 'fill', 'The lecturer recommends finishing studying at least ______ hour(s) before bed.', '[]'::jsonb, 'one|1', '''Stop studying at least one hour before bed.'''),
  ('b0000000-0000-4000-8000-000000000038', 'a0000000-0000-4000-8000-000000000004', 7, 'mcq', 'What drink does the lecturer warn against in the evening?', '["Tea","Milk","Coffee","Juice"]'::jsonb, 'Coffee', '''Avoid coffee after the middle of the afternoon.'''),
  ('b0000000-0000-4000-8000-000000000039', 'a0000000-0000-4000-8000-000000000004', 8, 'fill', 'Keeping the same ______ time every day helps the body clock.', '[]'::jsonb, 'wake-up|wakeup|wake up', '''Wake up at the same time every day, even at weekends.'''),
  ('b0000000-0000-4000-8000-000000000040', 'a0000000-0000-4000-8000-000000000004', 9, 'mcq', 'What is the lecturer''s final piece of advice?', '["Study in bed","Treat sleep as part of studying","Sleep less during exams","Only study at night"]'::jsonb, 'Treat sleep as part of studying', '''Treat sleep as part of your study plan, not a break from it.''')
on conflict (id) do nothing;

insert into public.lessons (id, kind, title, category, body, published) values
  ('d0000000-0000-4000-8000-000000000001', 'lesson', 'Reading Skill — Skim, Scan, Then Read Closely', 'Reading Skills', 'Most IELTS Reading problems are problems of time, not language. Use this three-pass method for every passage.

1) SKIM (2 minutes). Read the title, the first and last sentence of each paragraph, and any headings. Your goal is a map of the passage: what each paragraph is about. Write two or three key words beside each paragraph.

2) SCAN for the question''s keywords. Questions follow the order of the passage in most tasks. Find names, numbers and unusual words first — they are easiest to locate.

3) READ CLOSELY only the sentences around the answer. You do not need to understand every word in the passage; you need the exact sentence that answers the question.

Common trap: True / False / Not Given. ''False'' means the passage says the opposite. ''Not Given'' means the information simply is not there. If you cannot point to the exact line, the answer is probably Not Given.

Practise: take Reading Test 1 on this site and give yourself only 15 minutes.', true),
  ('d0000000-0000-4000-8000-000000000002', 'lesson', 'Listening Skill — Signpost Words', 'Listening Skills', 'IELTS Listening recordings are organised by signpost words — small phrases that tell you a new answer is coming or the topic is about to change.

Sequence: first, then, next, after that, finally.
Contrast: but, however, although, on the other hand.
Result: so, therefore, as a result.
Examples: for example, such as, like.
New section: ''Moving on to...'', ''Now let''s look at...''.

Two habits of high scorers:
1) Read the next questions while the recording introduces the section. Know what you are listening FOR before it starts.
2) If you miss an answer, let it go. The next question is coming in seconds, and losing the next two answers costs more than losing one.

Spelling matters: a correct word with wrong spelling scores zero. Practise days, months, numbers and common names.', true),
  ('d0000000-0000-4000-8000-000000000003', 'lesson', 'Understanding IELTS Band Scores', 'Band Scores', 'IELTS scores run from Band 1 (non-user) to Band 9 (expert user). Most universities ask for Band 6.0–7.5.

What the bands mean, in plain words:
Band 9 — Expert: full command of English.
Band 8 — Very good: only rare small mistakes.
Band 7 — Good: handles complex language well, some errors.
Band 6 — Competent: generally effective despite some mistakes.
Band 5 — Modest: partial command, frequent problems.
Band 4 — Limited: basic communication in familiar situations.

Your overall score is the average of Listening, Reading, Writing and Speaking, rounded to the nearest half band.

For Reading and Listening, roughly: 39–40/40 = Band 9, 37–38 = 8.5, 35–36 = 8, 32–34 = 7.5, 30–31 = 7, 26–29 = 6.5, 23–25 = 6, 18–22 = 5.5, 16–17 = 5 (Academic Reading, approximate — exact tables vary slightly by test).

The scores on this website''s short 10-question practice tests are estimates to guide your practice, not official results.', true)
on conflict (id) do nothing;

insert into public.writing_tasks (id, task_no, title, prompt, image_url, model_answer, tips, published) values
  ('e0000000-0000-4000-8000-000000000001', 1, 'Task 1 — Library Visits (Bar Chart)', 'The chart below shows the number of visits to a city library by three age groups (children, teenagers and adults) in 2015 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. (The chart shows: Children — 4,200 visits in 2015 and 5,600 in 2025; Teenagers — 1,800 in 2015 and 3,100 in 2025; Adults — 6,500 in 2015 and 5,900 in 2025.) Write at least 150 words.', '', 'The bar chart compares how often three age groups visited a city library in 2015 and 2025.

Overall, visits by children and teenagers increased over the period, while adult visits fell slightly. Children were the most frequent visitors in 2025, whereas adults had held that position in 2015.

In 2015, adults made the most library visits, at 6,500, followed by children with 4,200. Teenagers visited least often, at only 1,800 visits. Ten years later, the picture had changed considerably. Children''s visits rose by 1,400 to 5,600, and teenage visits climbed even more sharply, almost doubling to 3,100.

In contrast, adult visits declined from 6,500 to 5,900 over the same period. As a result, by 2025 the gap between adults and children had narrowed to just 300 visits, and teenagers, although still the smallest group, had closed much of the distance on the other two groups.', '1) Start with a paraphrase of the question. 2) Always write an overview — without one you cannot score above Band 5. 3) Group similar data together instead of listing every number. 4) Use past tenses for past years.', true),
  ('e0000000-0000-4000-8000-000000000002', 1, 'Task 1 — Internet Use (Line Graph)', 'The graph below shows the percentage of households with internet access in one country between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. (The graph shows: 2000 — 12%; 2005 — 31%; 2010 — 58%; 2015 — 79%; 2020 — 91%.) Write at least 150 words.', '', 'The line graph illustrates the proportion of households that had internet access in a particular country over a twenty-year period.

Overall, internet access rose steadily throughout the period. Growth was fastest between 2005 and 2015, before slowing slightly as the figure approached its maximum.

In 2000, only 12% of households were connected to the internet. This figure climbed to 31% by 2005 and then rose sharply over the next five years, reaching 58% in 2010. In other words, by 2010 a majority of households had internet access for the first time.

The upward trend continued between 2010 and 2015, when the percentage increased to 79%. After 2015, however, growth became more gradual, adding only 12 percentage points in five years. By 2020, 91% of households had internet access, meaning that fewer than one in ten homes remained offline.', '1) Describe trends (rise, fall, level off), not just numbers. 2) Use time phrases: ''between 2005 and 2010'', ''by 2020'', ''over the period''. 3) Compare key points, e.g. when the figure passed 50%.', true),
  ('e0000000-0000-4000-8000-000000000003', 2, 'Task 2 — University Education (Opinion Essay)', 'Some people believe that university education should be free for all students. To what extent do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.', '', 'It is often argued that governments should pay the full cost of university education so that no student has to pay fees. I agree with this view to a large extent, although I accept that a completely free system creates challenges that must be managed carefully.

The strongest argument for free university education is equality of opportunity. When fees are high, talented students from poor families may decide not to apply, or may graduate with heavy debts that limit their choices for years. A society loses a great deal when a future doctor or engineer is turned away simply because of family income. Free education ensures that places go to those who earn them through ability and hard work.

There are also wider benefits for the country as a whole. Graduates generally earn more, pay more tax and are less likely to need state support. In this sense, free university education is not a cost but an investment that repays itself many times over.

Admittedly, making universities free is expensive, and the money must come from taxes paid by everyone, including people who never attend university. There is also a risk that demand for places would grow faster than quality. These problems are real, but they can be reduced by limiting free places to students who meet clear academic standards.

In conclusion, I believe university education should be free for students who qualify for a place, because the benefits to individuals and to society far outweigh the costs.', '1) Give your opinion clearly in the introduction and keep it consistent. 2) Use two or three main-body paragraphs, each with one main idea, an explanation and an example. 3) A short concession (''Admittedly...'') makes your argument stronger. 4) Paraphrase the question — do not copy it.', true),
  ('e0000000-0000-4000-8000-000000000004', 2, 'Task 2 — Working from Home (Discussion Essay)', 'Some people think that working from home is beneficial for employees, while others believe it is better to work in an office. Discuss both views and give your own opinion. Write at least 250 words.', '', 'The question of whether employees should work from home or in an office has become widely debated in recent years. This essay will discuss both sides before giving my own view.

Supporters of home working point first to the time and money saved by not travelling. A worker who avoids a two-hour daily journey gains time for family, exercise and rest, and usually feels less stressed. Employers also benefit: staff who work from home are often just as productive, and companies can spend less on office space.

On the other hand, offices offer things that homes cannot easily provide. Colleagues can solve problems in minutes through a quick conversation, and new employees learn far more by watching experienced staff than by reading messages. There is also a social side to work; some people who work alone at home report feeling isolated, which can damage their motivation and health.

In my opinion, the best solution is a mixture of the two. Two or three days in the office each week preserve teamwork and friendship, while days at home give workers quiet time for concentrated tasks. Neither a fully remote nor a fully office-based system suits every job or every person.

In conclusion, both home and office working have clear advantages. A balanced approach, where possible, allows employees and companies to enjoy the benefits of each.', '1) Discuss BOTH views fully before your opinion — the question requires it. 2) Your opinion can appear in the introduction and the conclusion. 3) Use linking phrases: ''On the other hand'', ''In my opinion'', ''As a result''.', true)
on conflict (id) do nothing;

insert into public.speaking_topics (id, part, title, questions, published) values
  ('f0000000-0000-4000-8000-000000000001', 1, 'Part 1 — Hometown', '["Where is your hometown?","What do you like most about your hometown?","Has your hometown changed much in recent years?","Would you like to live in your hometown in the future?","What could be improved in your hometown?"]'::jsonb, true),
  ('f0000000-0000-4000-8000-000000000002', 1, 'Part 1 — Daily Routine', '["What time do you usually get up?","What is your favourite part of the day? Why?","Do you prefer to plan your day or take things as they come?","Has your daily routine changed since you were a child?","What routine would you like to change?"]'::jsonb, true),
  ('f0000000-0000-4000-8000-000000000003', 1, 'Part 1 — Reading', '["Do you enjoy reading?","What kind of books or articles do you read?","Do you prefer reading on paper or on a screen?","Did you read much when you were a child?","How often do you read news?"]'::jsonb, true),
  ('f0000000-0000-4000-8000-000000000004', 2, 'Part 2 — A Skill You Learned', '["Describe a skill that you learned as a child.","You should say:","— what the skill is","— who taught you it","— how you learned it","and explain why this skill is useful to you today."]'::jsonb, true),
  ('f0000000-0000-4000-8000-000000000005', 2, 'Part 2 — A Journey You Enjoyed', '["Describe a journey that you particularly enjoyed.","You should say:","— where you went","— who you travelled with","— what you did during the journey","and explain why you enjoyed it so much."]'::jsonb, true),
  ('f0000000-0000-4000-8000-000000000006', 2, 'Part 2 — A Useful App', '["Describe an app on your phone that you find very useful.","You should say:","— what the app is","— how often you use it","— what you use it for","and explain why you find it so useful."]'::jsonb, true),
  ('f0000000-0000-4000-8000-000000000007', 3, 'Part 3 — Technology and Society', '["How has technology changed the way people make friends?","Do you think people rely too much on technology today?","What are the advantages of online learning compared with classroom learning?","How might technology change jobs in the next twenty years?","Should governments control how much time children spend using screens?"]'::jsonb, true),
  ('f0000000-0000-4000-8000-000000000008', 3, 'Part 3 — Travel and Tourism', '["Why do so many people enjoy travelling to other countries?","What are the disadvantages of mass tourism for local people?","Do you think virtual travel could replace real travel in the future?","How can tourists behave more responsibly?","Is it better to travel alone or with others? Why?"]'::jsonb, true)
on conflict (id) do nothing;

insert into public.settings (key, value) values
  ('site_name', 'IELTSwithKaif'),
  ('hero_title', 'Prepare for IELTS. The smart way.'),
  ('hero_subtitle', 'Free Reading and Listening practice tests with instant scoring, Writing tasks with model answers, and Speaking practice — all in one place.'),
  ('announcement', 'New practice tests are added every week. Start a free test below!')
on conflict (key) do update set value = excluded.value;

-- Done. Check Table Editor: tests = 4 rows, questions = 40 rows,
-- lessons = 3, writing_tasks = 4, speaking_topics = 8, categories = 9.
