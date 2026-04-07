# 🎓 Child Learn System

> AI-powered intelligent learning management system for children, combining spaced repetition algorithm and generative AI.

## ✨ Features

- 📚 **Intelligent Content Generation** - Auto-generate learning materials using DeepSeek, Qwen, GLM, or OpenAI
- 🔄 **Spaced Repetition** - SM-2 algorithm optimized for children (max 21 days, EF: 1.2-2.0)
- 📊 **Smart Recommendations** - Three-tier priority system (Critical/Important/Optional)
- 📈 **Progress Tracking** - Real-time statistics, mastery levels, 30-day schedule
- 🎨 **Modern UI** - Responsive design with Astro + React + Tailwind
- 📱 **Offline-Ready** - Local file storage, GitHub backup support
- 📤 **Export Support** - Obsidian vault format for knowledge management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone and install
cd child-learn-system
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000`

### API Testing
```bash
# Run comprehensive test suite
./test-api.sh
```

## 📖 Documentation

- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Setup & usage guide
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference with examples
- **[PROJECT_PLAN.md](./PROJECT_PLAN.md)** - 5-phase development roadmap
- **[SPACED_REPETITION_ALGORITHM.md](./SPACED_REPETITION_ALGORITHM.md)** - SM-2 algorithm details
- **[LLM_PROMPTS_STRATEGY.md](./LLM_PROMPTS_STRATEGY.md)** - Prompt engineering guide
- **[PROGRESS_REPORT.md](./PROGRESS_REPORT.md)** - Development progress & metrics

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│   Frontend (React + Astro)      │
├─────────────────────────────────┤
│  Dashboard | Upload | Review    │
├─────────────────────────────────┤
│   REST API (Astro Routes)       │
├─────────────────────────────────┤
│ Upload | Generate | Recommend   │
│ Review | Stats | Schedule | Export
├─────────────────────────────────┤
│   Business Logic & Algorithms   │
├─────────────────────────────────┤
│   SM-2 | Priority System        │
├─────────────────────────────────┤
│   File System Storage (JSON)    │
└─────────────────────────────────┘
```

## 📊 7 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/upload` | Upload learning materials |
| POST | `/api/review` | Record review feedback |
| GET | `/api/recommend` | Get recommended items |
| GET | `/api/stats` | Learning statistics |
| GET | `/api/schedule` | 30-day review schedule |
| POST | `/api/generate` | Generate content (LLM) |
| POST | `/api/export` | Export as Obsidian vault |

## 🎯 Core Algorithms

### SM-2 Spaced Repetition (Optimized for Children)
- EF range: 1.2 - 2.0 (vs standard 1.3-2.5)
- Initial EF: 1.8 (more conservative)
- Max interval: 21 days (vs standard 30+)
- Difficulty decay: 0.85x when user feedback = "hard"

### Three-Tier Priority System
- 🔴 **Critical** (50%): Mastery < 50%
- 🟡 **Important** (30%): Mastery 50-80%
- 🟢 **Optional** (20%): Mastery >= 80%

## 📁 Project Structure

```
src/
├── pages/
│   ├── index.astro              # Home page
│   ├── dashboard.astro          # Learning dashboard
│   ├── upload.astro             # Upload interface
│   ├── review.astro             # Review interface
│   └── api/                     # 7 API endpoints
├── components/                  # React components
│   ├── Dashboard.tsx
│   ├── UploadForm.tsx
│   ├── ReviewCard.tsx
│   └── ReviewPage.tsx
├── layouts/                     # Astro layouts
│   └── Layout.astro
├── lib/                         # Core libraries
│   ├── types.ts                # Type definitions
│   ├── spaced-repetition/      # SM-2 algorithm
│   ├── llm/                    # LLM adapters
│   └── database/               # Database layer
└── data/                        # Learning data (auto-created)
    └── YYYY-MM-DD/
        ├── learning-items/
        ├── reviews/
        └── generated/
```

## 🔌 LLM Integration

Supports multiple LLM providers:
- **DeepSeek** (深度求索)
- **Qwen** (阿里云通义千问)
- **GLM** (智谱大模型)
- **OpenAI** (ChatGPT)

## 📝 Usage Example

### Upload a learning item
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "type": "vocabulary",
    "title": "Animals - Dog",
    "raw_content": "Dog is a domestic animal...",
    "tags": ["animals", "english"],
    "difficulty": "easy",
    "estimated_time": 5
  }'
```

### Get recommendations
```bash
curl http://localhost:3000/api/recommend?limit=10
```

### Record review feedback
```bash
curl -X POST http://localhost:3000/api/review \
  -H "Content-Type: application/json" \
  -d '{
    "learning_item_id": "uuid-here",
    "user_feedback": "good",
    "time_spent": 300
  }'
```

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Astro 6.0 |
| UI | React 18 |
| Styling | Tailwind CSS 3 |
| Language | TypeScript 5 |
| Storage | File System (JSON) |
| Algorithm | SM-2 (Custom) |

## 📊 Development Progress

| Phase | Status | Items |
|-------|--------|-------|
| 1 Planning | ✅ Done | Documentation & architecture |
| 2 API | ✅ Done | 7 endpoints + algorithms |
| 3 UI | ✅ Done | 4 pages + 4 components |
| 4 LLM Integration | 🟡 Planned | Real API connections |
| 5 Advanced Features | 🟡 Planned | Multi-user, knowledge graph |

**Overall Progress: 60% (Phase 1-3 complete)**

## 🚀 Next Steps

### Phase 4 Priorities
1. Real LLM API integration (DeepSeek/Qwen/GLM/OpenAI)
2. SQLite database migration
3. GitHub auto-backup
4. Multi-user support

### Phase 5 Vision
- Knowledge graph visualization
- Advanced analytics
- Mobile app support
- Collaborative learning

## 🎓 Designed for Children

This system incorporates several child-friendly optimizations:

1. **Cognitive Science**
   - SM-2 algorithm proven for long-term retention
   - Spaced repetition validated by research
   - Progressive difficulty scaling

2. **User Experience**
   - Colorful, engaging interface
   - Emoji-enhanced feedback
   - Progress visualization
   - Positive reinforcement

3. **Personalization**
   - Adaptive difficulty levels
   - Customized learning paths
   - Individual mastery tracking
   - Flexible pacing

## 📞 Support

- 📖 Check [GETTING_STARTED.md](./GETTING_STARTED.md) for setup issues
- 🐛 See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API questions
- 💻 Run `./test-api.sh` for diagnostics
- 📊 Review `PROGRESS_REPORT.md` for technical details

## 📄 License

This project is part of a personal learning initiative. Feel free to adapt and use for educational purposes.

## 🙏 Acknowledgments

- **SM-2 Algorithm**: Based on [SuperMemo](https://www.supermemo.com/)
- **Framework**: Built with [Astro](https://astro.build/) + [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

---

**Version**: 1.0.0 Beta  
**Last Updated**: 2026-04-07  
**Status**: Ready for use & development

🌟 **Making learning smarter, one child at a time.**
