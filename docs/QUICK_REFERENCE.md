# Quick Reference - Testing & AI Integration

## 🚀 Quick Start

```bash
# Install everything
npm install

# Run all unit tests
npm run test

# Run E2E tests
npm run test:e2e

# View test coverage
npm run test:coverage

# Interactive test dashboard
npm run test:ui
```

## 📚 Documentation Files

| File | Purpose | Size |
|------|---------|------|
| `TESTING.md` | Complete testing guide with examples | 400+ lines |
| `CLAUDE_INTEGRATION.md` | Claude Haiku 4.5 integration details | 300+ lines |
| `IMPLEMENTATION_SUMMARY.md` | Project implementation overview | 600+ lines |
| `VERIFICATION_CHECKLIST.md` | Verification and status | 300+ lines |
| `README.md` | Updated with testing & AI sections | +150 lines |

## 🧪 Test Commands

### Unit Tests (Vitest)
```bash
npm run test                          # Run once
npm run test -- --watch              # Watch mode
npm run test:ui                       # Dashboard
npm run test:coverage                 # Coverage report
npm run test -- src/test/api.test.ts # Single file
npm run test -- --grep "ChatInterface"# Pattern match
```

### E2E Tests (Playwright)
```bash
npm run test:e2e                     # Run all
npx playwright test --ui             # Interactive
npx playwright test -g "should send" # Pattern match
npx playwright test --project=firefox# Specific browser
npx playwright show-report           # View report
```

### Make Commands
```bash
make test                # Unit tests
make test-ui            # Test dashboard
make test-coverage      # Coverage
make test-e2e           # E2E tests
make test-all           # All tests
```

## 🤖 Claude Haiku 4.5

### Key Info
- **Model:** `claude-haiku-4-5`
- **Speed:** 200-500ms per query
- **Cost:** $0.0001-0.0005 per query
- **Context:** 200K tokens
- **Tools:** 6 MCP tools available

### Setup
```bash
# Set API key in .env
VITE_CLAUDE_API_KEY=sk-ant-...

# Or as environment variable
export VITE_CLAUDE_API_KEY=sk-ant-...
```

### MCP Tools Available
- `get_war_status` - Campaign status
- `get_planets` - Planetary data
- `get_campaign_info` - Campaign details
- `get_factions` - Faction info
- `get_biomes` - Biome data
- `get_statistics` - Game stats

## 📁 Test Files Location

```
src/test/
├── setup.ts                    # Global setup
├── api.test.ts                # API service tests
├── claude.test.ts             # Claude service tests
├── ChatInterface.test.tsx      # Component tests
└── DataDisplay.test.tsx        # Data display tests

e2e/
└── chat.spec.ts               # E2E chat tests
```

## 📊 Test Statistics

| Category | Count |
|----------|-------|
| Test Suites | 23+ |
| Test Cases | 50+ |
| E2E Tests | 14 |
| API Tests | 9+ |
| Component Tests | 30+ |
| Coverage Files | 4 |

## 🔧 Configuration Files

- `vitest.config.ts` - Unit test config
- `playwright.config.ts` - E2E test config
- `src/test/setup.ts` - Test setup/mocks
- `package.json` - Scripts and deps

## 🐛 Troubleshooting

### Tests won't run
```bash
rm -rf node_modules package-lock.json
npm install
npm run test
```

### Port 3000 in use
```bash
lsof -i :3000
kill -9 <PID>
```

### Playwright browsers missing
```bash
npx playwright install --with-deps
```

### Coverage not generated
```bash
npm run test:coverage -- --reporter=verbose
```

## 📖 Key Docs to Read

1. **Start Here:** `README.md` - Project overview
2. **For Testing:** `TESTING.md` - Complete testing guide
3. **For Claude:** `CLAUDE_INTEGRATION.md` - AI integration
4. **For Overview:** `IMPLEMENTATION_SUMMARY.md` - Full summary

## 🎯 Next Steps

1. ✅ Install: `npm install`
2. ✅ Test: `npm run test`
3. 📖 Read: `TESTING.md` for patterns
4. 🔄 CI/CD: Add GitHub Actions (example in TESTING.md)
5. 📊 Monitor: Track coverage metrics

## 💡 Tips

- Run `npm run test:ui` for interactive debugging
- Use `npm run test -- --watch` during development
- Check `TESTING.md` for mocking examples
- Review `claude.ts` for Claude integration patterns
- Add pre-commit hooks with `husky` for auto-testing

## 🔗 Useful Links

- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Claude API](https://docs.anthropic.com/)
- [MCP Protocol](https://modelcontextprotocol.io/)

## 📝 Notes

- All tests mock external APIs
- No actual API calls in unit tests
- E2E tests launch dev server automatically
- Coverage reports in `coverage/` directory
- Test output in terminal or HTML report

---

**Last Updated:** October 25, 2025  
**Version:** 1.0.0
