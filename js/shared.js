/* Shared (cross-play) content: glossary, comparisons, exam prep, plan.
   Edit freely; this file is plain data. */
window.SHARED = {
  playOrder: ["trifles", "sandbox", "raisin", "salesman"],
  playMeta: {
    trifles:  { short: "Trifles",  color: "trifles",  week: "Week 1" },
    sandbox:  { short: "The Sandbox", color: "sandbox", week: "Week 1" },
    raisin:   { short: "A Raisin in the Sun", color: "raisin", week: "Week 2" },
    salesman: { short: "Death of a Salesman", color: "salesman", week: "Week 3" }
  },
  // share of the study window given to each phase (must add up to 1)
  planPhases: [
    { id: "p1", title: "Trifles and The Sandbox", plays: ["trifles", "sandbox"], share: 0.2,
      note: "Two short plays. Read both, watch both, and finish the quizzes. They set up the themes of gender and absurdism." },
    { id: "p2", title: "A Raisin in the Sun", plays: ["raisin"], share: 0.25,
      note: "Read one act at a time. Watch the film after you finish reading. Write one practice essay." },
    { id: "p3", title: "Death of a Salesman", plays: ["salesman"], share: 0.3,
      note: "The longest and hardest play. Use the Present or Memory tag on every section and take your time with Act One." },
    { id: "p4", title: "Compare, review and practice exam", plays: [], share: 0.25,
      note: "Work through Compare the Plays, redo missed questions, take the full practice exam, and write a comparison essay." }
  ],

  universalRubric: [
    "Thesis: a clear claim that answers the question and can be argued",
    "Evidence: specific scenes or short quotes from the play",
    "Analysis: explains why the evidence proves the claim (not just what happened)",
    "Organization: each paragraph has one main point and the points connect",
    "Accuracy: names, events and order of events are correct",
    "Clarity: correct grammar and sentence structure; present tense for plot"
  ],

  glossary: [
    { term: "protagonist", cat: "Character", def: "The main character, the one whose struggle drives the story." },
    { term: "antagonist", cat: "Character", def: "The person or force that opposes the main character. It can be another person, society, or the character's own flaws." },
    { term: "foil", cat: "Character", def: "A character who is very different from another character, so that the differences show clearly. Example: Charley and Willy in Death of a Salesman." },
    { term: "stock character", cat: "Character", def: "A simple, familiar type of person (like \"the nagging wife\") used more as a symbol than as a real individual." },
    { term: "caricature", cat: "Character", def: "A person drawn with exaggerated traits to make a point or poke fun." },
    { term: "characterization", cat: "Character", def: "How a writer shows who a character is: through what they say, do, and how others talk about them." },
    { term: "tragedy", cat: "Genre", def: "A serious play in which the main character suffers a downfall, often because of a flaw or a bad choice, and the audience feels pity and fear." },
    { term: "tragic hero", cat: "Genre", def: "In classic tragedy, a person of high rank who falls because of a flaw. Arthur Miller argued that an ordinary person can also be a tragic hero." },
    { term: "hamartia", cat: "Genre", def: "A tragic flaw or mistake that leads to the character's downfall." },
    { term: "hubris", cat: "Genre", def: "Excessive pride." },
    { term: "catharsis", cat: "Genre", def: "The release of strong feelings, such as pity and fear, that the audience feels at the end of a tragedy." },
    { term: "anagnorisis", cat: "Genre", def: "The moment a character finally understands the truth about themselves or their situation." },
    { term: "dark comedy", cat: "Genre", def: "Humor used on serious or painful subjects such as death. The audience may laugh and feel uneasy at the same time." },
    { term: "satire", cat: "Genre", def: "Writing that makes fun of a person, group, or society in order to criticize it." },
    { term: "allegory", cat: "Genre", def: "A story in which characters and events stand for bigger ideas, such as death or society." },
    { term: "realism", cat: "Style", def: "A style that shows ordinary life as it really looks and sounds: believable people, normal speech, realistic rooms." },
    { term: "naturalism", cat: "Style", def: "A style close to realism that shows people shaped and often trapped by heredity, money, and environment." },
    { term: "expressionism", cat: "Style", def: "A style that shows inner feelings instead of outer reality. Sets, lighting, and sound can be distorted to show a character's mind." },
    { term: "absurdism", cat: "Style", def: "Also called Theater of the Absurd. A style in which logic, plot, and language break down to suggest that life lacks clear meaning. Albee, Beckett, and Ionesco wrote in this style." },
    { term: "Theater of the Absurd", cat: "Style", def: "A mid-1900s movement of plays that use strange situations and illogical dialogue to show that life can seem meaningless." },
    { term: "memory play", cat: "Style", def: "A play that shows events as one character remembers them, so time can shift freely. Death of a Salesman does this." },
    { term: "metatheater", cat: "Style", def: "Theater that knows it is theater. Characters may mention the script, the audience, or the actors. The Sandbox does this." },
    { term: "fourth wall", cat: "Style", def: "The invisible wall between the actors and the audience. Breaking it means a character speaks to the audience or admits they are in a play." },
    { term: "well-made play", cat: "Style", def: "A tightly built play with a clear plot, rising tension, and a satisfying resolution. A Raisin in the Sun is often called this." },
    { term: "one-act play", cat: "Style", def: "A short play with no act breaks, usually performed in under an hour." },
    { term: "symbol", cat: "Technique", def: "An object, person, or action that stands for a larger idea." },
    { term: "motif", cat: "Technique", def: "An image, sound, or idea that repeats through a work and builds meaning." },
    { term: "theme", cat: "Technique", def: "A big idea the work explores about life or people, such as \"the cost of ignoring the truth.\"" },
    { term: "irony", cat: "Technique", def: "A gap between what is expected and what happens, or between what is said and what is meant." },
    { term: "dramatic irony", cat: "Technique", def: "When the audience knows something that a character does not." },
    { term: "situational irony", cat: "Technique", def: "When the opposite of what you expect happens." },
    { term: "foreshadowing", cat: "Technique", def: "Hints early in a story about what will happen later." },
    { term: "flashback", cat: "Technique", def: "A scene that jumps back to an earlier time." },
    { term: "non-linear", cat: "Technique", def: "Not told in time order. Events move between past and present." },
    { term: "juxtaposition", cat: "Technique", def: "Placing two things side by side so the contrast stands out." },
    { term: "subtext", cat: "Technique", def: "The meaning under the words: what a character really feels or wants but does not say." },
    { term: "imagery", cat: "Technique", def: "Language or staging that appeals to the senses (sight, sound, touch)." },
    { term: "diction", cat: "Technique", def: "A writer's word choice." },
    { term: "tone", cat: "Technique", def: "The writer's attitude toward the subject, such as serious, bitter, or playful." },
    { term: "mood", cat: "Technique", def: "The feeling the audience gets while watching or reading." },
    { term: "ambiguity", cat: "Technique", def: "Something that can be understood in more than one way on purpose." },
    { term: "stage directions", cat: "Drama", def: "Instructions in the script about setting, movement, lighting, sound, and how lines are said." },
    { term: "monologue", cat: "Drama", def: "A long speech by one character." },
    { term: "soliloquy", cat: "Drama", def: "A speech where a character thinks aloud while alone on stage." },
    { term: "dialogue", cat: "Drama", def: "The conversation between characters." },
    { term: "exposition", cat: "Plot", def: "Background information that helps the audience understand the situation." },
    { term: "conflict", cat: "Plot", def: "The struggle at the center of the story. It can be person vs. person, person vs. society, or inside one character." },
    { term: "rising action", cat: "Plot", def: "The series of events that build tension toward the climax." },
    { term: "climax", cat: "Plot", def: "The turning point or moment of greatest tension." },
    { term: "resolution", cat: "Plot", def: "The ending, where the main conflict is settled (also called denouement)." },
    { term: "epigraph", cat: "Plot", def: "A short quotation placed at the start of a work to set a theme. A Raisin in the Sun begins with a Langston Hughes poem." },
    { term: "American Dream", cat: "Context", def: "The belief that anyone in America can succeed through hard work. Many writers ask who is left out and what the dream costs." },
    { term: "separate spheres", cat: "Context", def: "The old belief that men belong in public life (work, politics) and women belong in the home. Trifles shows its limits." },
    { term: "feminism", cat: "Context", def: "The movement and way of thinking that argues for equal rights and fair treatment of women." },
    { term: "assimilation", cat: "Context", def: "When a minority group takes on the habits and values of the larger culture, sometimes losing its own." },
    { term: "restrictive covenant", cat: "Context", def: "A legal agreement that once barred certain people, especially Black families, from buying homes in some neighborhoods." },
    { term: "the Great Depression", cat: "Context", def: "The severe economic crisis of the 1930s. Willy Loman's generation lived through it." },
    { term: "thesis", cat: "Writing", def: "The main claim of an essay, stated in one or two sentences." },
    { term: "claim", cat: "Writing", def: "A statement you argue is true about the text." },
    { term: "evidence", cat: "Writing", def: "Details from the text (a scene or short quote) that support your claim." },
    { term: "analysis", cat: "Writing", def: "Your explanation of how and why the evidence supports the claim." },
    { term: "paraphrase", cat: "Writing", def: "Saying what the text says in your own words." }
  ],

  compare: {
    themes: [
      { id: "dream", title: "The American Dream: who gets it and what it costs",
        summary: "Salesman and Raisin are the two big \"dream\" plays. The Sandbox mocks the comfortable American family. Trifles is less about the Dream itself.",
        cells: {
          salesman: "Willy believes success comes from being well-liked and having charm. The Dream turns out to be a lie he cannot let go of. His worth ends up measured in money.",
          raisin: "The Youngers want a house, safety, and a future. The Dream is real but blocked by racism and money. Hughes's idea of a \"dream deferred\" runs under the whole play.",
          trifles: "Not a main focus. The closest link is what a hard, isolated farm life took from Minnie Foster.",
          sandbox: "Albee mocks the comfortable \"ideal\" American family. Mommy and Daddy are shallow and cold toward Grandma."
        } },
      { id: "gender", title: "Gender, power, and who gets heard",
        summary: "Trifles is the core text. The others show how gender roles shape who speaks and who decides.",
        cells: {
          salesman: "Linda is loyal and wise, but she stays at the edges of the big decisions. Willy and his sons define manhood as success and being liked.",
          raisin: "Beneatha wants to be a doctor and refuses to be defined by marriage. Walter believes a man must lead the household. Mama holds real authority.",
          trifles: "The men dismiss the women's world as \"trifles\" and miss the clues. The women read the kitchen and decide together to protect Minnie.",
          sandbox: "Mommy bosses Daddy around. Albee exaggerates both of them into types to criticize empty marriage roles."
        } },
      { id: "family", title: "Family, generations, and care for the old",
        summary: "Every play puts a family or household at the center, but each asks a different question about duty between generations.",
        cells: {
          salesman: "Willy's expectations crush Biff, and Biff's resentment hurts Willy. The sons must decide whether to live Willy's dream or their own.",
          raisin: "Three generations share one apartment. Mama's values clash with Walter's ambitions and Beneatha's independence.",
          trifles: "A childless, quiet house is part of Minnie's loneliness. Nobody checked on her.",
          sandbox: "Grandma is treated as a burden and put out of the way. The younger generation performs grief but feels little."
        } },
      { id: "illusion", title: "Illusion vs. reality",
        summary: "Salesman is the strongest case, but every play has people who refuse or fail to see what is in front of them.",
        cells: {
          salesman: "Willy lives in memories and lies about his success. Biff's choice to speak honestly is the play's turning point.",
          raisin: "Walter chases a get-rich-quick scheme. Mr. Lindner's polite offer hides a plain wish to keep the Youngers out.",
          trifles: "The men look hard but miss the evidence in the kitchen because they do not value it. The women see clearly.",
          sandbox: "The characters admit they are in a play. The line between acting and real feeling is blurred on purpose."
        } },
      { id: "justice", title: "Class, race, and justice",
        summary: "Raisin and Trifles ask who gets fair treatment. Salesman asks what business owes its workers.",
        cells: {
          salesman: "Howard fires Willy after decades of service. The play asks whether a business system treats workers as people or as tools.",
          raisin: "Housing discrimination is the central obstacle. The family's choice to move is a stand for dignity as well as a home.",
          trifles: "The women weigh legal justice against moral justice. The law is represented by the men, but the women decide what to do with the evidence.",
          sandbox: "Less central. The play criticizes a society that discards the old and the unproductive."
        } },
      { id: "form", title: "Form: realism vs. non-realism",
        summary: "A favorite exam topic. The four plays sit along a line from very realistic to absurd.",
        cells: {
          salesman: "A memory play with expressionist staging. The set has see-through walls and time moves freely between the present and Willy's memories.",
          raisin: "Realism. One apartment, believable speech, a well-made plot that builds to a decision.",
          trifles: "Realism in a single kitchen, in one act. The key characters (the Wrights) never appear on stage.",
          sandbox: "Absurdism. The characters are types, the dialogue is stylized, and the play knows it is a play (metatheater)."
        } }
    ],
    spectrum: [
      { play: "trifles", label: "Realism" },
      { play: "raisin", label: "Realism" },
      { play: "salesman", label: "Memory play / expressionism" },
      { play: "sandbox", label: "Absurdism" }
    ],
    essays: [
      { id: "cmp-dream", type: "theme", targetWords: 450,
        prompt: "Compare how Death of a Salesman and A Raisin in the Sun treat the American Dream. Which play is more hopeful, and why?",
        rubricFocus: ["A clear position on which play is more hopeful", "Specific scenes from both plays", "Comparison in every body paragraph, not two separate summaries", "Reference to what each family loses or keeps at the end"],
        thesisStarters: [
          "Although both plays show a family chasing the American Dream, ___ is more hopeful because ___.",
          "Miller shows the Dream as ___, while Hansberry shows it as ___."
        ],
        modelOutline: [
          "Thesis: Raisin is more hopeful because the family keeps its dignity and moves forward together, while Salesman ends with Willy's collapse.",
          "Point 1: What each father believes about success (Willy: being liked; Walter: money fast) and how each belief fails.",
          "Point 2: The decision scene: Biff's honesty vs. Walter's refusal of Lindner's offer. Compare what each choice shows.",
          "Point 3: The ending: Willy's death and the Requiem vs. the Youngers' move.",
          "Conclusion: Both plays criticize a Dream that hurts people, but only Raisin ends with a family choosing a future."
        ],
        modelParagraph: "Both plays show fathers who are crushed by a version of the American Dream, but Raisin ends with a family still moving forward while Salesman ends at a grave. Willy Loman believes success comes from being well-liked, and he holds on to that belief even after Howard fires him. His death, meant to leave Biff insurance money, shows how thoroughly he has confused his worth with money. Walter Younger also chases quick money, and he loses the family's savings to a con man. But in the final scene he refuses Mr. Lindner's offer to buy them out and chooses the family's pride over cash. Willy's last choice is to leave his family, while Walter's is to lead his. This contrast suggests that the Dream is not hopeless, but that it can only be rebuilt on dignity and family, not on salesmanship.",
        annotation: "The paragraph opens with a position, compares both plays in almost every sentence, gives specific events as evidence, and explains what the contrast means.",
        checklist: ["I state which play is more hopeful in my first paragraph", "Every body paragraph mentions both plays", "I use at least two specific scenes from each play", "I explain why each scene matters, not just what happens", "I compare the endings", "My conclusion says something about the American Dream, not only about the plays"] },
      { id: "cmp-silence", type: "craft", targetWords: 450,
        prompt: "Trifles and The Sandbox both show people ignoring someone they see as unimportant. Compare how each play uses its form (realism, absurdism, stage directions, or setting) to make that point.",
        rubricFocus: ["A claim about how form creates meaning", "Specific features of each play's form (not just plot)", "Clear connection between form and the point about being ignored", "Comparison, not two separate summaries"],
        thesisStarters: [
          "Glaspell uses realism to ___, while Albee uses absurdism to ___, but both ___.",
          "In both plays, the person being ignored is ___, and the form shows this by ___."
        ],
        modelOutline: [
          "Thesis: Both plays turn the ignored person into the key to the story, but Glaspell does it through quiet realism and Albee through exaggerated absurdism.",
          "Point 1: Trifles: the men dismiss kitchen \"trifles,\" the audience sees the clues; Minnie is never on stage.",
          "Point 2: The Sandbox: Grandma is dumped, talked over, and spoken about as if absent; the characters are exaggerated types and the play admits it is a play.",
          "Point 3: Both use setting (the kitchen, the sandbox) to make an ordinary place carry heavy meaning.",
          "Conclusion: Different styles, same warning: ignoring someone is a choice that hides a serious cost."
        ],
        modelParagraph: "Trifles and The Sandbox use very different forms to show the cost of ignoring someone. Glaspell uses quiet realism. The sheriff and county attorney walk through Minnie Wright's kitchen and treat it as a place of trifles, so they miss the broken jars, the uneven quilting, and the dead bird. The audience, watching the women, sees the story the men cannot. Minnie herself never appears, which makes her silence part of the point. Albee uses absurdism and exaggeration. Mommy and Daddy treat Grandma as an item to be put away, and they talk about her in front of her. The play even makes fun of itself when the Young Man says he has a line to deliver. Both plays place a person at the center who is treated as unimportant, and in both the form makes the audience feel what the characters refuse to see.",
        annotation: "The paragraph gives each play its own supporting details, connects each detail to the shared point, and ends by explaining what the form does to the audience.",
        checklist: ["I name the form or technique for each play (realism, absurdism, staging)", "I use at least two details from each play", "I explain how each detail changes how the audience feels", "I compare the two plays in my thesis and conclusion", "I say who is ignored in each play", "I avoid just retelling the plot"] },
      { id: "cmp-setting", type: "craft", targetWords: 450,
        prompt: "Each of the four plays is set in one very specific place (a kitchen, a stage house, an apartment, a beach). Choose two plays and show how the setting reveals character and theme.",
        rubricFocus: ["A claim about what the setting means, not just what it looks like", "Specific details from the stage directions or scenes", "Connection between setting and character or theme", "Comparison of the two settings"],
        thesisStarters: [
          "In ___ the setting ___, while in ___ the setting ___.",
          "The settings of ___ and ___ both trap their characters, but ___."
        ],
        modelOutline: [
          "Thesis: Both settings press in on the characters, but one shows a family closed in by money and the other a woman closed in by isolation.",
          "Point 1: First setting: what it looks like, what the stage directions show, and what it says about the characters.",
          "Point 2: Second setting with the same structure.",
          "Point 3: Compare: both are ordinary rooms made meaningful; one is crowded, the other quiet.",
          "Conclusion: In both plays, where people live shapes who they can become."
        ],
        modelParagraph: "In A Raisin in the Sun and Trifles, ordinary rooms hold more meaning than they first seem to. Hansberry's Younger apartment is small and worn, and one plant stretches toward the little sunlight the room allows. The crowded rooms show a family whose dreams are bigger than their space. In Trifles, Glaspell sets the whole play in a cold, untidy farm kitchen. The men see a mess. The women read the same room as a record of Minnie Wright's life: the broken jars, the half-finished quilt, the empty cage. Both rooms act like characters, but they work in opposite ways. The Younger apartment is crowded with people who want out, while the Wright kitchen is empty because the person who lived there was cut off from everyone. Each setting shows what the characters are missing.",
        annotation: "The paragraph describes each setting briefly, ties each to character, and then compares them directly.",
        checklist: ["I choose two plays and name them in the thesis", "I describe at least two concrete details of each setting", "I explain what each detail shows about a character or theme", "I compare the two settings directly", "My conclusion says something about all settings, not just my two", "I avoid summarizing the plot"] },
      { id: "cmp-form", type: "theme", targetWords: 450,
        prompt: "Choose two of the four plays. Argue which one uses its form (realism, memory play, or absurdism) more effectively to deliver its main message.",
        rubricFocus: ["A clear argument about effectiveness (not just description)", "Specific formal features of each play", "Link between form and the play's message", "Fair treatment of the play you say is less effective"],
        thesisStarters: [
          "Although ___ is also effective, ___ uses its form more successfully because ___.",
          "The form of ___ (___) makes its message ___ in a way that ___ does not."
        ],
        modelOutline: [
          "Thesis: names the two plays and which form works better, with a reason.",
          "Point 1: What the first play's form is and how it delivers the message.",
          "Point 2: What the second play's form is and how it delivers the message.",
          "Point 3: Direct comparison: where one form is stronger.",
          "Conclusion: What this tells us about how form shapes meaning."
        ],
        modelParagraph: "Death of a Salesman uses its memory-play form more effectively than Trifles uses realism, because Miller lets the audience feel Willy's mind breaking down. Walls of the Loman house become see-through, and a scene of the present can suddenly slide into the past. When Willy argues with Biff and then hears an old memory of Biff as a teenager, we understand that for Willy the past is not finished. Glaspell's realism is effective in its own way: the audience watches the women piece together a case from ordinary objects. But realism asks the audience to observe from outside, while Miller's form puts us inside a character's thoughts. That closeness makes Willy's fall feel personal as well as social, and it carries Miller's message about illusion more powerfully.",
        annotation: "The paragraph gives a clear judgment, credits the other play fairly, and explains why one form pulls the audience in more.",
        checklist: ["I name the form of each play", "I state which is more effective and why", "I use at least two specific scenes", "I treat the other play fairly", "I connect form to the message", "I avoid just describing the forms"] }
    ]
  },

  examPrep: {
    paragraphGuide: [
      { step: "Claim", text: "Start with one sentence that answers the question. Example: \"Willy Loman cannot accept that being liked is not the same as being successful.\"" },
      { step: "Evidence", text: "Point to one specific scene or give a short quote. Name who says it or does it and where in the play." },
      { step: "Analysis", text: "Explain how the evidence proves your claim. This is the part that earns the B. Ask yourself: so what? what does this show?" },
      { step: "Link", text: "End by connecting back to the big idea or the next paragraph." }
    ],
    rubricLevels: [
      { grade: "C", looks: "Retells the plot. Thesis is vague or missing. Evidence is general (\"in the play...\"). Little explanation." },
      { grade: "B", looks: "Clear thesis that answers the question. Two or three specific scenes. Each piece of evidence is explained. Organized in paragraphs. Few errors." },
      { grade: "A", looks: "Thesis with a real argument. Precise, well-chosen quotes. Analysis that goes deeper (craft, context, contrast). Smooth organization and a conclusion that adds something." }
    ],
    mistakes: [
      "Retelling the plot instead of arguing. Your professor already knows what happens.",
      "Quoting without explaining. A quote never speaks for itself.",
      "Writing about the author's life instead of the text. Use context only to support a point about the play.",
      "Using past tense for the plot. Write in present tense: \"Willy tells Linda...\"",
      "Ignoring the question. Reread it before every paragraph.",
      "Mixing up characters or scenes. Use the character map if unsure."
    ],
    questionTypes: [
      { type: "Multiple choice or matching", tip: "Read all four choices. Eliminate wrong ones first. Watch for choices that are true in a different play." },
      { type: "Identification (who, what, where)", tip: "Name the character or object, the play, and one sentence on why it matters." },
      { type: "Quote analysis", tip: "Say who speaks, to whom, in what moment, and what the line reveals about character or theme." },
      { type: "Short answer", tip: "Two to five sentences. Answer, evidence, explanation. No introduction." },
      { type: "Essay", tip: "Spend the first five minutes on a mini outline. Thesis, three points, evidence for each. Leave time to reread." }
    ],
    thesisFormulas: [
      "In [play], [author] shows that [claim about theme] through [technique or scene].",
      "Although [obvious reading], [play] ultimately suggests [your claim] because [reason].",
      "[Character] is / is not a tragic hero because [reason 1] and [reason 2].",
      "Both [play A] and [play B] show [shared idea], but [play A] does it through [X] while [play B] uses [Y]."
    ],
    tragedyBox: {
      title: "The tragic hero question (a favorite for Salesman)",
      aristotle: "Aristotle's tragic hero is a person of high rank, with a flaw (hamartia), who falls and gains understanding. The audience feels pity and fear.",
      miller: "In his essay \"Tragedy and the Common Man,\" Miller argued that an ordinary person can be a tragic hero if they are willing to risk everything for their sense of dignity.",
      yes: "Yes: Willy fights for what he believes is his place and name. He has a flaw (pride, self-delusion) and he gives up his life.",
      no: "No: Willy never fully understands himself. Some critics say his story is more pitiful than tragic, and that the system (not only his flaw) is the cause.",
      tip: "Take a side, define \"tragic hero\" in your first paragraph, and use two scenes."
    },
    planTips: [
      "Spaced review beats cramming: use the flashcards a little each day.",
      "Do a quiz right after you read. Getting it wrong is part of learning.",
      "Write your answers before you look at the model.",
      "Say your thesis out loud. If you cannot explain it in one breath, simplify.",
      "In the last week, retake missed questions and do the full practice exam once."
    ]
  }
};
