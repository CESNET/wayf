CREATE TABLE "feed" (
    "eid" TEXT NOT NULL,
    "label" TEXT NOT NULL
);
CREATE TABLE "sp" (
    "id" TEXT NOT NULL,
    "logouri" TEXT
);
CREATE TABLE "spfeed" (
    "spid" TEXT NOT NULL,
    "feedid" TEXT NOT NULL
);
CREATE TABLE "spDiscoveryResponse" (
    "spid" TEXT NOT NULL,
    "location" TEXT NOT NULL
);
CREATE TABLE "spAssertionConsume" (
    "spid" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    UNIQUE(spid,location)
);
CREATE UNIQUE INDEX "ieidlabel" on feed (eid ASC, label ASC);
CREATE UNIQUE INDEX "ispfeed" on spfeed (spid ASC, feedid ASC);
CREATE UNIQUE INDEX "spid" on sp (id ASC);
CREATE TABLE "displayName" (
    "eid" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "label" TEXT NOT NULL
);
CREATE UNIQUE INDEX "i_eid_lang" on displayname (eid ASC, lang ASC);
