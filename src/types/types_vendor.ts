
export interface VendorSearchAll {
    [id: string]: VendorSearch;
}

export interface VendorSearch {
    search: Search;
    urls: string[];
    url: string;
    products: string[];
    paths: string[];
}

export interface Search {
    search_metadata: SearchMetadata;
    search_parameters: SearchParameters;
    search_information: SearchInformation;
    knowledge_graph: KnowledgeGraph;
    related_questions: RelatedQuestion[];
    organic_results: OrganicResult[];
    pagination: Pagination;
    serpapi_pagination: Pagination;
}

export interface KnowledgeGraph {
    title: string;
    place_id: string;
    website: string;
    local_map: LocalMap;
    rating: number;
    review_count: number;
    raw_hours: string;
    hours: Hours;
    merchant_description: string;
}

export interface Hours {
    sunday: Day;
    monday: Day;
    tuesday: Day;
    wednesday: Day;
    thursday: Day;
    friday_good_friday: Day;
    saturday: Day;
}

export interface Day {
    opens: string;
    closes: string;
}

export interface LocalMap {
    image: string;
    link: string;
    gps_coordinates: GpsCoordinates;
}

export interface GpsCoordinates {
    latitude: number;
    longitude: number;
    altitude: number;
}

export interface OrganicResult {
    position: number;
    title: string;
    link: string;
    displayed_link: string;
    snippet: string;
    snippet_highlighted_words: string[];
    about_this_result: AboutThisResult;
    about_page_link: string;
    about_page_serpapi_link: string;
    cached_page_link: string;
    rich_snippet?: RichSnippet;
}

export interface AboutThisResult {
    source: Source;
}

export interface Source {
    description: string;
    source_info_link: string;
    security: Security;
    icon: string;
}

export enum Security {
    Secure = "secure",
}

export interface RichSnippet {
    top: Top;
}

export interface Top {
    detected_extensions: DetectedExtensions;
    extensions: string[];
}

export interface DetectedExtensions {
    price: number;
    currency: string;
}

export interface Pagination {
    current: number;
    next: string;
    other_pages: { [key: string]: string };
    next_link?: string;
}

export interface RelatedQuestion {
    question: string;
    snippet: string;
    title: string;
    link: string;
    displayed_link: string;
    thumbnail: string;
    next_page_token: string;
    serpapi_link: string;
}

export interface SearchInformation {
    organic_results_state: string;
    error_message: string;
    total_results: number;
    time_taken_displayed: number;
    menu_items: MenuItem[];
}

export interface MenuItem {
    position: number;
    title: string;
    link: string;
    serpapi_link?: string;
}

export interface SearchMetadata {
    id: string;
    status: string;
    json_endpoint: string;
    created_at: string;
    processed_at: string;
    google_url: string;
    raw_html_file: string;
    total_time_taken: number;
}

export interface SearchParameters {
    engine: string;
    q: string;
    location_requested: string;
    location_used: string;
    google_domain: string;
    hl: string;
    gl: string;
    device: string;
}
