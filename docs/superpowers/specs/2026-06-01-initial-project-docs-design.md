# openprice-kr Initial Project Docs Design

## Purpose

`openprice-kr` will start as a small, clear open-source project for Korean shopping price comparison.

The first goal is not to build a full app. The first goal is to make the repository understandable and credible on GitHub.

Plain Korean summary:

- This project compares Korean shopping prices.
- It aims to cover gaps that Danawa or Naver price comparison may not fully solve.
- It will begin carefully, without risky large-scale crawling.
- The project documents will clearly explain what is known, what is not decided yet, and what comes next.

Developer terms:

- repository introduction
- MVP scope
- data sourcing policy
- open-source project positioning

## Initial Scope

Create a documentation-first repository foundation.

Files to create in the next implementation step:

- `README.md`
- `.gitignore`
- `LICENSE`
- `docs/vision.md`
- `docs/data-safety.md`

This phase will not create:

- shopping mall crawling code
- app UI
- backend API
- database schema
- deployment configuration
- real product price dataset

## Repository Positioning

The project should be described as an open-source toolkit or experiment for Korean e-commerce price comparison.

It should not claim to already be a finished service.

The README should make the current stage obvious:

- early MVP planning
- documentation-first setup
- safe data collection research
- future sample-data-based comparison flow

## Data And Safety Direction

The project should avoid promising broad automated scraping at this stage.

The first public documentation should say that data collection methods will be reviewed carefully, including:

- public APIs
- user-provided URLs
- sample data
- permission-friendly sources
- terms of service and robots.txt considerations

The documentation should separate:

- what the project wants to compare
- how price data may be collected later
- what legal or platform risks still need review

## Success Criteria

This phase is successful when:

- a new visitor can understand what `openprice-kr` is
- the repository does not overclaim unfinished features
- the MVP direction is narrow and practical
- data collection risk is acknowledged early
- the project is ready for a later implementation plan

## Testing And Verification

Since this phase is documentation-focused, verification will be simple:

- confirm the expected files exist
- confirm Korean text is saved as UTF-8
- review the written documents for unclear claims
- run `git status` to inspect changed files

No app or unit tests are required in this phase because no executable product code will be added.

## Open Decisions For Later

These decisions are intentionally left for a later planning step:

- whether the first demo will be a CLI, web app, or static report
- whether to use sample data first or a public API first
- which license is best for the project
- how GitHub issues and contribution rules should be organized
- whether Council review is needed before choosing a data collection strategy
