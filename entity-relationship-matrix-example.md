# Entity Relationship Matrix - Example for Your Thesis

## Option A: Relationship Type Matrix

This shows the cardinality/type of relationships between entities:

```
Table 3.1: Entity Relationship Matrix - Database Schema Relationships

┌───────────────┬─────────────┬───────────────┬───────────────┐
│               │ USER_ROLES  │ USER_STORIES  │ MODULE_RISKS  │
├───────────────┼─────────────┼───────────────┼───────────────┤
│ USER_ROLES    │      -      │     1:M       │       -       │
│               │             │ (evaluates)   │               │
├───────────────┼─────────────┼───────────────┼───────────────┤
│ USER_STORIES  │    M:1      │      -        │     M:1       │
│               │ (evaluated  │               │ (references)  │
│               │  by)        │               │               │
├───────────────┼─────────────┼───────────────┼───────────────┤
│ MODULE_RISKS  │      -      │     1:M       │       -       │
│               │             │ (tracked by)  │               │
└───────────────┴─────────────┴───────────────┴───────────────┘

Legend:
- 1:M = One-to-Many relationship
- M:1 = Many-to-One relationship
- "-" = No direct relationship
```

---

## Option B: Constraint Matrix (More Detailed)

This shows specific constraints and keys:

```
Table 3.1: Entity Relationship Constraint Matrix

┌────────────────┬──────────────────┬─────────────────────┬──────────────────┐
│ Entity         │ Primary Key      │ Foreign Keys        │ Unique           │
│                │                  │                     │ Constraints      │
├────────────────┼──────────────────┼─────────────────────┼──────────────────┤
│ USER_ROLES     │ id (PK)          │ None                │ email            │
│                │                  │                     │                  │
├────────────────┼──────────────────┼─────────────────────┼──────────────────┤
│ USER_STORIES   │ id (PK)          │ module_id → MODULE_ │ None             │
│                │                  │ RISKS.id            │                  │
│                │                  │                     │                  │
├────────────────┼──────────────────┼─────────────────────┼──────────────────┤
│ MODULE_RISKS   │ id (PK)          │ None                │ module_name      │
│                │                  │                     │                  │
└────────────────┴──────────────────┴─────────────────────┴──────────────────┘
```

---

## Option C: Attribute-Relationship Matrix

This maps which attributes participate in relationships:

```
Table 3.1: Entity-Attribute Relationship Matrix

┌─────────────────────────┬───────────────┬──────────────┬──────────────┐
│ Relationship            │ Source Entity │ Source Attr  │ Target Attr  │
│                         │ / Target      │              │              │
├─────────────────────────┼───────────────┼──────────────┼──────────────┤
│ User evaluates stories  │ USER_ROLES    │ email        │ -            │
│                         │ → USER_STORIES│              │ (title)      │
│                         │               │              │              │
├─────────────────────────┼───────────────┼──────────────┼──────────────┤
│ Story references risk   │ USER_STORIES  │ module_id    │ id           │
│ module                  │ → MODULE_RISKS│ (FK)         │ (PK)         │
│                         │               │              │              │
└─────────────────────────┴───────────────┴──────────────┴──────────────┘
```

---

## RECOMMENDED TEXT FOR YOUR THESIS:

Replace your current section with this:

```
3.4.1 Database Design (Entity Relationship Model)

The persistence tier of the AQMS is structured as a relational database schema
designed to enforce data integrity and track multi-state sprint variables. The
model comprises three core entities that map user identity access levels to user
stories, and link those stories to modular system risks.

Table 3.1 presents the Entity Relationship Matrix, showing the structural
relationships and constraints between the core database entities. Figure 3.2
provides the corresponding Entity Relationship Diagram with visual representations
of cardinality and referential integrity constraints.

[INSERT TABLE 3.1 HERE - Use Option A or B above]

The matrix demonstrates three critical design decisions:

1. USER_ROLES maintains a one-to-many relationship with USER_STORIES through the
   email unique constraint, enabling role-based story evaluation tracking.

2. USER_STORIES references MODULE_RISKS through the module_id foreign key,
   establishing a many-to-one relationship that links each story to its associated
   risk module.

3. MODULE_RISKS serves as the parent entity for risk aggregation, with each module
   tracking bug_frequency and impact_multiplier metrics across multiple linked stories.

[INSERT FIGURE 3.2 HERE - Your ER Diagram]

Figure 3.2: Entity Relationship Diagram - Visual Schema Representation

This dual representation (matrix + diagram) ensures both tabular analysis of
constraints and visual comprehension of data flow patterns.
```

---

## Which Format Should You Use?

**For an academic thesis, I recommend Option B (Constraint Matrix) because:**

1. ✅ Shows technical details (keys, constraints)
2. ✅ Clearly identifies foreign key relationships
3. ✅ Demonstrates database design knowledge
4. ✅ Easy to create in Word/LaTeX table format
5. ✅ Complements the diagram (diagram shows flow, matrix shows constraints)

---

## Quick ASCII Table You Can Copy-Paste:

```
Table 3.1: Entity Relationship Constraint Matrix

+----------------+------------------+---------------------+------------------+
| Entity         | Primary Key      | Foreign Keys        | Unique           |
|                |                  |                     | Constraints      |
+----------------+------------------+---------------------+------------------+
| USER_ROLES     | id (PK)          | None                | email            |
|                |                  |                     |                  |
+----------------+------------------+---------------------+------------------+
| USER_STORIES   | id (PK)          | module_id →         | None             |
|                |                  | MODULE_RISKS.id     |                  |
|                |                  |                     |                  |
+----------------+------------------+---------------------+------------------+
| MODULE_RISKS   | id (PK)          | None                | module_name      |
|                |                  |                     |                  |
+----------------+------------------+---------------------+------------------+

Key: PK = Primary Key, FK = Foreign Key, → = References
```

---

## Summary:

Your supervisor is correct - you need to either:

1. **Change title** to "Entity Relationship Diagram" (simpler)
2. **Add a matrix table** before the diagram (better, more complete)

I recommend **Option 2** - Add the matrix table (Table 3.1) BEFORE your diagram (Figure 3.2), then update your text to reference both.

Would you like me to format this as a proper Word table or LaTeX table for you to copy directly into your thesis?
