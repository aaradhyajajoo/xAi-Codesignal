import sqlite3
from datetime import datetime


def init_db():
    conn = sqlite3.connect("leads.db")
    c = conn.cursor()

    # Enable foreign key support
    c.execute("PRAGMA foreign_keys = ON;")

    # Create leads table with restricted stage values and default
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            company TEXT,
            industry TEXT,
            budget REAL,
            needs TEXT,
            score REAL,
            stage TEXT DEFAULT 'potential_lead' CHECK(stage IN ('potential_lead', 'reached_out', 'response_received')),
            last_message TEXT,
            interaction_log TEXT,
            UNIQUE(name, company)
        )
        """
    )

    # Create interactions table
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lead_id INTEGER,
            message TEXT,
            direction TEXT CHECK(direction IN ('inbound', 'outbound')),
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
        )
        """
    )

    conn.commit()
    conn.close()


def add_lead(lead):
    try:
        conn = sqlite3.connect("leads.db")
        c = conn.cursor()
        c.execute(
            "INSERT INTO leads (name, company, industry, budget, needs, score, stage) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                lead["name"],
                lead["company"],
                lead["industry"],
                lead["budget"],
                lead["needs"],
                0,
                "potential_lead",
            ),
        )
        lead_id = c.lastrowid
        conn.commit()
        return lead_id

    except sqlite3.IntegrityError as e:
        # Likely caused by UNIQUE constraint violation
        print(f"IntegrityError: {e}")
        raise

    except sqlite3.Error as e:
        # Catch all other SQLite-related errors
        print(f"Database error: {e}")
        raise

    finally:
        conn.close()


def add_interaction(lead_id, interaction):
    print(f"Adding interaction for lead {lead_id}: {interaction}")
    try:
        conn = sqlite3.connect("leads.db")
        c = conn.cursor()

        # Handle timestamp parsing more robustly
        try:
            if isinstance(interaction["timestamp"], str):
                timestamp_str = datetime.fromisoformat(
                    interaction["timestamp"]
                ).strftime("%Y-%m-%d %H:%M:%S")
            else:
                # If timestamp is already a datetime object or None, use current time
                timestamp_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        except (ValueError, TypeError):
            # Fallback to current timestamp if parsing fails
            timestamp_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        c.execute(
            """
            INSERT INTO interactions (lead_id, message, direction, timestamp)
            VALUES (?, ?, ?, ?)
            """,
            (
                lead_id,
                interaction["message"],
                interaction["direction"],
                timestamp_str,
            ),
        )

        # Determine the new stage based on direction
        if interaction["direction"] == "outbound":
            new_stage = "reached_out"
        elif interaction["direction"] == "inbound":
            new_stage = "response_received"
        else:
            raise ValueError("Invalid direction: must be 'inbound' or 'outbound'")

        # Update lead stage
        c.execute(
            """
            UPDATE leads
            SET stage = ?
            WHERE id = ?
            """,
            (new_stage, lead_id),
        )

        conn.commit()
        return c.lastrowid

    except sqlite3.IntegrityError as e:
        # Likely caused by foreign key constraint or direction check
        print(f"IntegrityError in add_interaction: {e}")
        raise

    except Exception as e:
        # Catch all other errors and provide more context
        print(f"Database error in add_interaction: {e}")
        print(f"Lead ID: {lead_id}")
        print(f"Interaction data: {interaction}")
        raise

    finally:
        conn.close()


def get_leads(lead_id=None):
    conn = sqlite3.connect("leads.db")
    c = conn.cursor()
    if lead_id:
        c.execute("SELECT * FROM leads WHERE id = ?", (lead_id,))
    else:
        c.execute("SELECT * FROM leads")
    leads = [
        {
            "id": r[0],
            "name": r[1],
            "company": r[2],
            "industry": r[3],
            "budget": r[4],
            "needs": r[5],
            "score": r[6],
            "stage": r[7],
            "last_message": r[8],
            "interaction_log": r[9],
        }
        for r in c.fetchall()
    ]
    conn.close()
    return leads


def update_lead(lead_id, updates):
    conn = sqlite3.connect("leads.db")
    c = conn.cursor()
    for key, value in updates.items():
        c.execute(f"UPDATE leads SET {key} = ? WHERE id = ?", (value, lead_id))
    conn.commit()
    conn.close()


def search_leads(query):
    conn = sqlite3.connect("leads.db")
    c = conn.cursor()
    c.execute(
        "SELECT * FROM leads WHERE company LIKE ? OR needs LIKE ? OR interaction_log LIKE ?",
        (f"%{query}%", f"%{query}%", f"%{query}%"),
    )
    leads = [
        {
            "id": r[0],
            "name": r[1],
            "company": r[2],
            "industry": r[3],
            "budget": r[4],
            "needs": r[5],
            "score": r[6],
            "stage": r[7],
            "last_message": r[8],
            "interaction_log": r[9],
        }
        for r in c.fetchall()
    ]
    conn.close()
    return leads
