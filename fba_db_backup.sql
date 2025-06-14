--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-1.pgdg120+1)
-- Dumped by pg_dump version 15.13 (Debian 15.13-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: yujiacheng
--

CREATE TYPE public."OrderStatus" AS ENUM (
    '宸蹭笅鍗?,
    '宸叉敹璐?,
    '杞繍涓?,
    '宸茬鏀?,
    '閫€浠?,
    '宸插彇娑?
);


ALTER TYPE public."OrderStatus" OWNER TO yujiacheng;

--
-- Name: PermissionType; Type: TYPE; Schema: public; Owner: yujiacheng
--

CREATE TYPE public."PermissionType" AS ENUM (
    'VIEW_WAYBILL',
    'CREATE_WAYBILL',
    'UPDATE_WAYBILL',
    'CANCEL_WAYBILL',
    'VIEW_CUSTOMER',
    'CREATE_CUSTOMER',
    'UPDATE_CUSTOMER',
    'VIEW_CHANNEL',
    'UPDATE_CHANNEL',
    'VIEW_REPORT',
    'EXPORT_EXCEL',
    'CREATE_STAFF',
    'ASSIGN_ROLE',
    'UPDATE_PASSWORD'
);


ALTER TYPE public."PermissionType" OWNER TO yujiacheng;

--
-- Name: RoleType; Type: TYPE; Schema: public; Owner: yujiacheng
--

CREATE TYPE public."RoleType" AS ENUM (
    'SUPER_ADMIN',
    'TENANT_ADMIN',
    'TENANT_STAFF'
);


ALTER TYPE public."RoleType" OWNER TO yujiacheng;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Box; Type: TABLE; Schema: public; Owner: yujiacheng
--

CREATE TABLE public."Box" (
    id text NOT NULL,
    code text NOT NULL,
    "fbaOrderId" text,
    "tradOrderId" text,
    asin text,
    brand text,
    "declaredQuantity" integer DEFAULT 1 NOT NULL,
    "declaredValue" double precision DEFAULT 0.0 NOT NULL,
    fnsku text,
    height double precision,
    "hsCode" text,
    length double precision,
    material text DEFAULT ''::text NOT NULL,
    model text,
    "productNameCn" text DEFAULT ''::text NOT NULL,
    "productNameEn" text DEFAULT ''::text NOT NULL,
    sku text,
    usage text,
    weight double precision DEFAULT 0.0 NOT NULL,
    width double precision
);


ALTER TABLE public."Box" OWNER TO yujiacheng;

--
-- Name: Channel; Type: TABLE; Schema: public; Owner: yujiacheng
--

CREATE TABLE public."Channel" (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    country text,
    warehouse text,
    origin text,
    currency text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    code text NOT NULL,
    aging text,
    "allowCancel" boolean DEFAULT false NOT NULL,
    "allowChannelChange" boolean DEFAULT false NOT NULL,
    "allowEdit" boolean DEFAULT false NOT NULL,
    "allowLabelUpload" boolean DEFAULT false NOT NULL,
    "allowTrackingEntry" boolean DEFAULT false NOT NULL,
    "assignedUser" text,
    "boxPrecision" double precision,
    "chargeMethod" text,
    "controlBilling" boolean DEFAULT false NOT NULL,
    "controlReceivingFee" boolean DEFAULT false NOT NULL,
    "cubeRatio" double precision,
    "decimal" text,
    "declareCurrency" text,
    "defaultDeclareCurrency" text,
    "enableBilling" boolean DEFAULT false NOT NULL,
    "enableCOD" boolean DEFAULT false NOT NULL,
    "hideCarrier" boolean DEFAULT false NOT NULL,
    "labelCode" text,
    "maxBoxChargeWeight" double precision,
    "maxBoxRealWeight" double precision,
    "maxDeclareValue" double precision,
    "maxPieces" integer,
    "maxTicketChargeWeight" double precision,
    "maxTicketRealWeight" double precision,
    method text,
    "minBoxAvgWeight" double precision,
    "minBoxChargeWeight" double precision,
    "minBoxChargeWeightLimit" double precision,
    "minBoxMaterialWeight" double precision,
    "minBoxRealWeight" double precision,
    "minBoxRealWeightLimit" double precision,
    "minCharge" double precision,
    "minDeclareValue" double precision,
    "minPieces" integer,
    "minTicketChargeWeight" double precision,
    "minTicketRealWeight" double precision,
    "modifyVolRatio" boolean DEFAULT false NOT NULL,
    "noAutoCancelAPIFail" boolean DEFAULT false NOT NULL,
    "noRefundOnCancel" boolean DEFAULT false NOT NULL,
    "orderBySKULibrary" boolean DEFAULT false NOT NULL,
    "promptUnderpayment" boolean DEFAULT false NOT NULL,
    "refundOnReturn" boolean DEFAULT false NOT NULL,
    "requireEORI" boolean DEFAULT false NOT NULL,
    "requireEmail" boolean DEFAULT false NOT NULL,
    "requirePackingList" boolean DEFAULT false NOT NULL,
    "requirePhone" boolean DEFAULT false NOT NULL,
    "requireSize" boolean DEFAULT false NOT NULL,
    "requireVAT" boolean DEFAULT false NOT NULL,
    "requireVATFiling" boolean DEFAULT false NOT NULL,
    "requireWeight" boolean DEFAULT false NOT NULL,
    "restrictWarehouseCode" boolean DEFAULT false NOT NULL,
    "roundBeforeSplit" boolean DEFAULT false NOT NULL,
    rounding text,
    sender text,
    "showBilling" boolean DEFAULT false NOT NULL,
    "showInWMS" boolean DEFAULT false NOT NULL,
    "showSize" boolean DEFAULT false NOT NULL,
    "showSupplierData" boolean DEFAULT false NOT NULL,
    "showWeight" boolean DEFAULT false NOT NULL,
    "sizePrecision" double precision,
    "splitRatio" double precision,
    "ticketPrecision" double precision,
    "userLevel" text,
    "verifyImageLink" boolean DEFAULT false NOT NULL,
    "verifySalesLink" boolean DEFAULT false NOT NULL,
    "volRatio" double precision,
    "waybillRuleId" text
);


ALTER TABLE public."Channel" OWNER TO yujiacheng;

--
-- Name: FBAOrder; Type: TABLE; Schema: public; Owner: yujiacheng
--

CREATE TABLE public."FBAOrder" (
    id text NOT NULL,
    channel text NOT NULL,
    recipient text NOT NULL,
    country text NOT NULL,
    quantity integer NOT NULL,
    weight double precision NOT NULL,
    cargo text NOT NULL,
    status public."OrderStatus" NOT NULL,
    "createdAt" text NOT NULL,
    "tenantId" text NOT NULL,
    "customerId" text NOT NULL,
    type text NOT NULL,
    warehouse text NOT NULL,
    length double precision,
    width double precision,
    height double precision,
    "hasBattery" boolean DEFAULT false NOT NULL,
    "clientCode" text,
    company text,
    phone text,
    email text,
    store text,
    ref1 text,
    vat text,
    ioss text,
    eori text,
    currency text,
    category text,
    "productName" text,
    attrs text[],
    notes text,
    insurance boolean DEFAULT false NOT NULL,
    address1 text,
    address2 text,
    address3 text,
    city text,
    "declaredQuantity" integer,
    "declaredValue" double precision,
    "hasDangerous" boolean DEFAULT false NOT NULL,
    "hasMagnetic" boolean DEFAULT false NOT NULL,
    "postalCode" text,
    sender text,
    state text,
    "hasLiquid" boolean DEFAULT false NOT NULL,
    "hasPowder" boolean DEFAULT false NOT NULL,
    "allowCustomerCancel" boolean DEFAULT false NOT NULL,
    "billingPrecision" integer,
    "chargeWeight" double precision,
    "isCOD" boolean DEFAULT false NOT NULL,
    "labelUploaded" boolean DEFAULT false NOT NULL,
    "trackingNumber" text,
    "waybillNumber" text,
    "waybillRuleId" text
);


ALTER TABLE public."FBAOrder" OWNER TO yujiacheng;

--
-- Name: Permission; Type: TABLE; Schema: public; Owner: yujiacheng
--

CREATE TABLE public."Permission" (
    id text NOT NULL,
    type public."PermissionType" NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public."Permission" OWNER TO yujiacheng;

--
-- Name: RateRule; Type: TABLE; Schema: public; Owner: yujiacheng
--

CREATE TABLE public."RateRule" (
    id text NOT NULL,
    "channelId" text NOT NULL,
    "minWeight" double precision NOT NULL,
    "maxWeight" double precision NOT NULL,
    "weightType" text NOT NULL,
    divisor integer,
    "sideRule" text,
    "extraFee" double precision,
    "baseRate" double precision NOT NULL,
    "taxRate" double precision,
    "otherFee" double precision,
    priority integer NOT NULL
);


ALTER TABLE public."RateRule" OWNER TO yujiacheng;

--
-- Name: Tenant; Type: TABLE; Schema: public; Owner: yujiacheng
--

CREATE TABLE public."Tenant" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Tenant" OWNER TO yujiacheng;

--
-- Name: TraditionalOrder; Type: TABLE; Schema: public; Owner: yujiacheng
--

CREATE TABLE public."TraditionalOrder" (
    id text NOT NULL,
    channel text NOT NULL,
    recipient text NOT NULL,
    country text NOT NULL,
    quantity integer NOT NULL,
    weight double precision NOT NULL,
    cargo text NOT NULL,
    status public."OrderStatus" NOT NULL,
    "createdAt" text NOT NULL,
    "tenantId" text NOT NULL,
    "customerId" text NOT NULL,
    type text NOT NULL,
    warehouse text NOT NULL,
    length double precision,
    width double precision,
    height double precision,
    "hasBattery" boolean DEFAULT false NOT NULL,
    "clientCode" text,
    company text,
    phone text,
    email text,
    store text,
    ref1 text,
    vat text,
    ioss text,
    eori text,
    currency text,
    category text,
    "productName" text,
    attrs text[],
    notes text,
    insurance boolean DEFAULT false NOT NULL,
    address1 text,
    address2 text,
    address3 text,
    city text,
    "declaredQuantity" integer,
    "declaredValue" double precision,
    "hasDangerous" boolean DEFAULT false NOT NULL,
    "hasMagnetic" boolean DEFAULT false NOT NULL,
    "postalCode" text,
    sender text,
    state text,
    "hasLiquid" boolean DEFAULT false NOT NULL,
    "hasPowder" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."TraditionalOrder" OWNER TO yujiacheng;

--
-- Name: User; Type: TABLE; Schema: public; Owner: yujiacheng
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    password text NOT NULL,
    role public."RoleType" DEFAULT 'TENANT_STAFF'::public."RoleType" NOT NULL,
    "tenantId" text NOT NULL
);


ALTER TABLE public."User" OWNER TO yujiacheng;

--
-- Name: WaybillRule; Type: TABLE; Schema: public; Owner: yujiacheng
--

CREATE TABLE public."WaybillRule" (
    id text NOT NULL,
    name text NOT NULL,
    pattern text NOT NULL,
    "channelId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."WaybillRule" OWNER TO yujiacheng;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: yujiacheng
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO yujiacheng;

--
-- Data for Name: Box; Type: TABLE DATA; Schema: public; Owner: yujiacheng
--

COPY public."Box" (id, code, "fbaOrderId", "tradOrderId", asin, brand, "declaredQuantity", "declaredValue", fnsku, height, "hsCode", length, material, model, "productNameCn", "productNameEn", sku, usage, weight, width) FROM stdin;
68a44742-1180-4440-90ea-e517e5a116b6	2	2	\N	\N	\N	1	0	\N	\N	\N	\N		\N			\N	\N	0	\N
3a860ed7-ce2f-4663-bd13-9e32dcb70eca	1	1	\N	\N	\N	1	0	\N	\N	\N	\N		\N			\N	\N	0	\N
19a350aa-ba2c-400d-b0ca-80c195d7380d	2	1	\N	\N	\N	1	0	\N	\N	\N	\N		\N			\N	\N	0	\N
9eb73ecb-fa82-45b2-baad-423ac3f56408	3	1	\N	\N	\N	1	0	\N	\N	\N	\N		\N			\N	\N	0	\N
c490e744-a922-4d17-93b3-6e6662445eb8	4	1	\N	\N	\N	1	0	\N	\N	\N	\N		\N			\N	\N	0	\N
d2430e8b-0a90-4290-8780-037b04591afa	5	1	\N	\N	\N	1	0	\N	\N	\N	\N		\N			\N	\N	0	\N
9e93e876-6b4e-4a5f-ae5b-6b6da24bb022	6	1	\N	\N	\N	1	0	\N	\N	\N	\N		\N			\N	\N	0	\N
c6fdb4b2-4889-47c4-b3cc-9f33fa318577	7	1	\N	\N	\N	1	0	\N	\N	\N	\N		\N			\N	\N	0	\N
dac96234-02e9-472c-99bc-fc5872604931	8	1	\N	\N	\N	1	0	\N	\N	\N	\N		\N			\N	\N	0	\N
dcf92c43-ff0d-4b25-8a0b-d2f16c828d01	9	1	\N	\N	\N	1	0	\N	\N	\N	\N		\N			\N	\N	0	\N
a8cb6173-9fa7-4e7b-a798-99bb020a8592	10	1	\N	\N	\N	1	0	\N	\N	\N	\N		\N			\N	\N	0	\N
7b7134a7-6634-4e27-b9bf-aed1dbd70d4f	11	1	\N	\N	\N	1	0	\N	\N	\N	\N		\N			\N	\N	0	\N
9fadb7f8-cb9e-4dc6-9514-187602e9b83b	BOX001	WB123456789	\N	\N	\N	1	0	\N	\N	\N	\N		\N			\N	\N	0	\N
f1a581bf-377b-47bf-8825-3ebbc63cebd8	BOX001	BOX001	\N	ASIN123	BrandX	30	3	FNSKU123	20	HS123456	50	PU	ModelY	鎵嬫満澹?Phone Case	SKU001	Personal Use	10.5	30
ce01eedd-3c5c-4a21-b2ec-a9a89cc1d653	555	555	\N			1	0		\N		\N							0	\N
\.


--
-- Data for Name: Channel; Type: TABLE DATA; Schema: public; Owner: yujiacheng
--

COPY public."Channel" (id, name, type, country, warehouse, origin, currency, "createdAt", code, aging, "allowCancel", "allowChannelChange", "allowEdit", "allowLabelUpload", "allowTrackingEntry", "assignedUser", "boxPrecision", "chargeMethod", "controlBilling", "controlReceivingFee", "cubeRatio", "decimal", "declareCurrency", "defaultDeclareCurrency", "enableBilling", "enableCOD", "hideCarrier", "labelCode", "maxBoxChargeWeight", "maxBoxRealWeight", "maxDeclareValue", "maxPieces", "maxTicketChargeWeight", "maxTicketRealWeight", method, "minBoxAvgWeight", "minBoxChargeWeight", "minBoxChargeWeightLimit", "minBoxMaterialWeight", "minBoxRealWeight", "minBoxRealWeightLimit", "minCharge", "minDeclareValue", "minPieces", "minTicketChargeWeight", "minTicketRealWeight", "modifyVolRatio", "noAutoCancelAPIFail", "noRefundOnCancel", "orderBySKULibrary", "promptUnderpayment", "refundOnReturn", "requireEORI", "requireEmail", "requirePackingList", "requirePhone", "requireSize", "requireVAT", "requireVATFiling", "requireWeight", "restrictWarehouseCode", "roundBeforeSplit", rounding, sender, "showBilling", "showInWMS", "showSize", "showSupplierData", "showWeight", "sizePrecision", "splitRatio", "ticketPrecision", "userLevel", "verifyImageLink", "verifySalesLink", "volRatio", "waybillRuleId") FROM stdin;
0ed85061-cace-47a9-be83-7be46afb7669							2025-05-23 09:54:33.278	CH-	\N	f	f	f	f	f	\N	\N	\N	f	f	\N	\N	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	f	f	f	f	f	\N	\N	\N	\N	f	f	\N	\N
\.


--
-- Data for Name: FBAOrder; Type: TABLE DATA; Schema: public; Owner: yujiacheng
--

COPY public."FBAOrder" (id, channel, recipient, country, quantity, weight, cargo, status, "createdAt", "tenantId", "customerId", type, warehouse, length, width, height, "hasBattery", "clientCode", company, phone, email, store, ref1, vat, ioss, eori, currency, category, "productName", attrs, notes, insurance, address1, address2, address3, city, "declaredQuantity", "declaredValue", "hasDangerous", "hasMagnetic", "postalCode", sender, state, "hasLiquid", "hasPowder", "allowCustomerCancel", "billingPrecision", "chargeWeight", "isCOD", "labelUploaded", "trackingNumber", "waybillNumber", "waybillRuleId") FROM stdin;
test-id-1	FBA娴疯繍	Test Recipient	涓浗	1	10.5	Test Cargo	杞繍涓?2025-05-21T12:00:00Z	some-tenant-id	some-customer-id	FBA	浠撳簱A	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	f	f	f	\N	\N	f	f	\N	\N	\N
2	FBA娴疯繍		涓浗	1	100		杞繍涓?2025-05-21T13:06:24.185Z	some-tenant-id	some-customer-id	FBA	浠撳簱A	1	1	1	f													{}		f	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	f	f	f	\N	\N	f	f	\N	\N	\N
1	FBA娴疯繍	娣卞湷甯傞缚寰″浗闄呯墿娴佹湁闄愬叕鍙?18926481745	鏃ユ湰	11	1		杞繍涓?2025-05-22T02:43:26.912Z	some-tenant-id	some-customer-id	FBA	浠撳簱B	1	1	1	f	00223	娣卞湷甯傞缚寰″浗闄呯墿娴佹湁闄愬叕鍙?18926481745	1029250466@qq.com									{甯︾數}		t	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	f	f	f	\N	\N	f	f	\N	\N	\N
WB123456789	涓撶嚎閫熻繍	Tom	DE	1	10.5	Phone Case	杞繍涓?2025-05-22T06:10:24.418Z	some-tenant-id	some-customer-id	FBA	WH001	50	30	20	t	CC001	ABC Corp	+1234567890	example@domain.com	Store001	REF001	VAT123456	\N	\N	USD	PU	Phone Case	{PU,SKU001}	Handle with care	f	Am Wald 1			Oranienburg	30	3	f	f	16515	\N	Brandenburg	f	f	f	\N	\N	f	f	\N	\N	\N
BOX001	涓撶嚎閫熻繍	Tom	DE	1	10.5		杞繍涓?2025-05-22T07:18:08.120Z	some-tenant-id	some-customer-id	FBA	ADDR001	\N	\N	\N	t	CC001	ABC Corp	+1234567890	example@domain.com	Store001	REF001	VAT123456	\N	\N	\N			{}	Handle with care	t	Am Wald 1			Oranienburg	\N	\N	f	f	16515	\N	Brandenburg	f	f	f	\N	\N	f	f	\N	\N	\N
555	FBA绌鸿繍	娣卞湷甯傞缚寰″浗闄呯墿娴佹湁闄愬叕鍙?18926481745	鏃ユ湰	1	1		宸蹭笅鍗?2025-05-22T07:24:50.152Z	some-tenant-id	some-customer-id	FBA	浠撳簱A	\N	\N	\N	f	00223	娣卞湷甯傞缚寰″浗闄呯墿娴佹湁闄愬叕鍙?18926481745	1029250466@qq.com				\N	\N				{}		f	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	f	f	f	\N	\N	f	f	\N	\N	\N
\.


--
-- Data for Name: Permission; Type: TABLE DATA; Schema: public; Owner: yujiacheng
--

COPY public."Permission" (id, type, "userId") FROM stdin;
\.


--
-- Data for Name: RateRule; Type: TABLE DATA; Schema: public; Owner: yujiacheng
--

COPY public."RateRule" (id, "channelId", "minWeight", "maxWeight", "weightType", divisor, "sideRule", "extraFee", "baseRate", "taxRate", "otherFee", priority) FROM stdin;
ad35103a-edbc-453c-bf88-7f3300dde35b	0ed85061-cace-47a9-be83-7be46afb7669	50	120	KG	\N	\N	\N	50	\N	\N	1
60edf751-af27-4fd2-a464-a842bc6c0ac3	0ed85061-cace-47a9-be83-7be46afb7669	2	5	CBM	\N	\N	\N	600	\N	\N	2
\.


--
-- Data for Name: Tenant; Type: TABLE DATA; Schema: public; Owner: yujiacheng
--

COPY public."Tenant" (id, name, "createdAt") FROM stdin;
some-tenant-id	Test Tenant	2025-05-21 12:00:00
\.


--
-- Data for Name: TraditionalOrder; Type: TABLE DATA; Schema: public; Owner: yujiacheng
--

COPY public."TraditionalOrder" (id, channel, recipient, country, quantity, weight, cargo, status, "createdAt", "tenantId", "customerId", type, warehouse, length, width, height, "hasBattery", "clientCode", company, phone, email, store, ref1, vat, ioss, eori, currency, category, "productName", attrs, notes, insurance, address1, address2, address3, city, "declaredQuantity", "declaredValue", "hasDangerous", "hasMagnetic", "postalCode", sender, state, "hasLiquid", "hasPowder") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: yujiacheng
--

COPY public."User" (id, name, email, "createdAt", password, role, "tenantId") FROM stdin;
some-customer-id	Test User	test@example.com	2025-05-21 12:00:00	hashed-password	TENANT_STAFF	some-tenant-id
\.


--
-- Data for Name: WaybillRule; Type: TABLE DATA; Schema: public; Owner: yujiacheng
--

COPY public."WaybillRule" (id, name, pattern, "channelId", "createdAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: yujiacheng
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
1eb78b9d-75b3-4666-8116-6e90679357eb	535a86edf0491efba2841f7d042ee9e8b3624883ff5f47c81912638a0b9ac28a	2025-05-19 12:41:44.650616+00	20250519120856_init	\N	\N	2025-05-19 12:41:44.63119+00	1
c97be17c-1d35-4f04-9c20-3f183d770a66	e0e61a18baebe0a60d18104cf213d6f17808dcea8a47b75c2e762237e9572d00	2025-05-19 12:41:45.104982+00	20250519124144_init	\N	\N	2025-05-19 12:41:45.096768+00	1
d964a982-cb0f-4c77-b883-55126aafb5b9	051f7d32c046e79dec1b1a7cfeef0616f36abe5cef5c0d5a9e777d0710b71975	2025-05-21 12:21:57.070544+00	20250521122156_init	\N	\N	2025-05-21 12:21:57.032154+00	1
d980a5c7-ddc8-4aff-9ae6-f471c7d75a66	be47ed734840e1a800cc395cc9a1d8f9ea7da9043f1d602a82b090d0e5d102c7	2025-05-22 06:01:04.055514+00	20250522060103_add_new_fields	\N	\N	2025-05-22 06:01:04.046119+00	1
f4ddfca1-d0ca-4ba0-b47d-8157ca905ff7	351e524b74a06b9d7635e392eae658c69e6c19a8def1454a08f10c48ac12ffed	2025-05-22 07:17:38.63204+00	20250522071738_extend_box_table	\N	\N	2025-05-22 07:17:38.622629+00	1
57c55ad6-744b-4017-a2bc-b1872393bdca	a87d2f8706fdf93187d913001772bcf4fbd3cc8617acb112a653132b5330b138	2025-05-23 08:34:52.254709+00	20250523083451_add_channel_rates	\N	\N	2025-05-23 08:34:52.223713+00	1
\.


--
-- Name: Box Box_pkey; Type: CONSTRAINT; Schema: public; Owner: yujiacheng
--

ALTER TABLE ONLY public."Box"
    ADD CONSTRAINT "Box_pkey" PRIMARY KEY (id);


--
-- Name: Channel Channel_pkey; Type: CONSTRAINT; Schema: public; Owner: yujiacheng
--

ALTER TABLE ONLY public."Channel"
    ADD CONSTRAINT "Channel_pkey" PRIMARY KEY (id);


--
-- Name: FBAOrder FBAOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: yujiacheng
--

ALTER TABLE ONLY public."FBAOrder"
    ADD CONSTRAINT "FBAOrder_pkey" PRIMARY KEY (id);


--
-- Name: Permission Permission_pkey; Type: CONSTRAINT; Schema: public; Owner: yujiacheng
--

ALTER TABLE ONLY public."Permission"
    ADD CONSTRAINT "Permission_pkey" PRIMARY KEY (id);


--
-- Name: RateRule RateRule_pkey; Type: CONSTRAINT; Schema: public; Owner: yujiacheng
--

ALTER TABLE ONLY public."RateRule"
    ADD CONSTRAINT "RateRule_pkey" PRIMARY KEY (id);


--
-- Name: Tenant Tenant_pkey; Type: CONSTRAINT; Schema: public; Owner: yujiacheng
--

ALTER TABLE ONLY public."Tenant"
    ADD CONSTRAINT "Tenant_pkey" PRIMARY KEY (id);


--
-- Name: TraditionalOrder TraditionalOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: yujiacheng
--

ALTER TABLE ONLY public."TraditionalOrder"
    ADD CONSTRAINT "TraditionalOrder_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: yujiacheng
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WaybillRule WaybillRule_pkey; Type: CONSTRAINT; Schema: public; Owner: yujiacheng
--

ALTER TABLE ONLY public."WaybillRule"
    ADD CONSTRAINT "WaybillRule_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: yujiacheng
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Channel_waybillRuleId_key; Type: INDEX; Schema: public; Owner: yujiacheng
--

CREATE UNIQUE INDEX "Channel_waybillRuleId_key" ON public."Channel" USING btree ("waybillRuleId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: yujiacheng
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: WaybillRule_channelId_key; Type: INDEX; Schema: public; Owner: yujiacheng
--

CREATE UNIQUE INDEX "WaybillRule_channelId_key" ON public."WaybillRule" USING btree ("channelId");


--
-- Name: Box Box_fbaOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yujiacheng
--

ALTER TABLE ONLY public."Box"
    ADD CONSTRAINT "Box_fbaOrderId_fkey" FOREIGN KEY ("fbaOrderId") REFERENCES public."FBAOrder"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Box Box_tradOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yujiacheng
--

ALTER TABLE ONLY public."Box"
    ADD CONSTRAINT "Box_tradOrderId_fkey" FOREIGN KEY ("tradOrderId") REFERENCES public."TraditionalOrder"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Channel Channel_waybillRuleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yujiacheng
--

ALTER TABLE ONLY public."Channel"
    ADD CONSTRAINT "Channel_waybillRuleId_fkey" FOREIGN KEY ("waybillRuleId") REFERENCES public."WaybillRule"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FBAOrder FBAOrder_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yujiacheng
--

ALTER TABLE ONLY public."FBAOrder"
    ADD CONSTRAINT "FBAOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FBAOrder FBAOrder_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yujiacheng
--

ALTER TABLE ONLY public."FBAOrder"
    ADD CONSTRAINT "FBAOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FBAOrder FBAOrder_waybillRuleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yujiacheng
--

ALTER TABLE ONLY public."FBAOrder"
    ADD CONSTRAINT "FBAOrder_waybillRuleId_fkey" FOREIGN KEY ("waybillRuleId") REFERENCES public."WaybillRule"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Permission Permission_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yujiacheng
--

ALTER TABLE ONLY public."Permission"
    ADD CONSTRAINT "Permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RateRule RateRule_channelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yujiacheng
--

ALTER TABLE ONLY public."RateRule"
    ADD CONSTRAINT "RateRule_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES public."Channel"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TraditionalOrder TraditionalOrder_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yujiacheng
--

ALTER TABLE ONLY public."TraditionalOrder"
    ADD CONSTRAINT "TraditionalOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TraditionalOrder TraditionalOrder_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yujiacheng
--

ALTER TABLE ONLY public."TraditionalOrder"
    ADD CONSTRAINT "TraditionalOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yujiacheng
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

