// src/pages/FAQPage.jsx

import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { 
  ChevronDown, ChevronUp, Search, FileText, Clock, Users, 
  Building, Landmark, Scale, TrendingUp, AlertCircle, 
  HelpCircle, BookOpen, ExternalLink, CheckCircle, XCircle,
  Phone, Mail, MapPin, Award, Shield, Home, Briefcase
} from 'lucide-react';

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openSections, setOpenSections] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'eligibility', name: 'Eligibility', icon: Users },
    { id: 'process', name: 'Application Process', icon: FileText },
    { id: 'waiting', name: 'Waiting List', icon: Clock },
    { id: 'allocation', name: 'Allocation & After', icon: Award },
    { id: 'commercial', name: 'Commercial/Agri', icon: Briefcase },
    { id: 'disputes', name: 'Disputes & Issues', icon: Scale },
    { id: 'reforms', name: 'Current Reforms', icon: TrendingUp }
  ];

  const faqData = [
    // ==================== SECTION 1: ELIGIBILITY & BASIC REQUIREMENTS ====================
    {
      id: 'q1',
      category: 'eligibility',
      question: 'Who is eligible to apply for tribal land?',
      answer: 'All citizens of Botswana aged 18 years and over are eligible to apply for available tribal land in any tribal territory or area in Botswana. Since the 1993 amendment to the Tribal Land Act, the primary qualification for a customary grant is no longer tribal affiliation but citizenship — a citizen is in theory qualified to apply for a customary land grant in any part of the country.',
      source: 'Tribal Land Act (Cap. 32:02)'
    },
    {
      id: 'q2',
      category: 'eligibility',
      question: 'Can I apply for land in a district I do not come from?',
      answer: 'Yes. Following the 1993 legislative reform, tribal affiliation is no longer a requirement. Any Botswana citizen can apply in any tribal territory, regardless of which district they originate from.',
      source: 'Tribal Land Act (Cap. 32:02)'
    },
    {
      id: 'q3',
      category: 'eligibility',
      question: 'Can non-citizens apply for tribal land?',
      answer: 'No. Tribal land applications are reserved for Botswana citizens. Under the Tribal Land Act 2018, a Deed of Customary Land Grant is issued to citizens, while non-citizens receive a lease. Non-citizens may lease state land for industrial or residential use—commercial leases are for 50 years, residential leases for 99 years. For tribal land, non-citizens require consent of the Minister.',
      source: 'Tribal Land Act 2018'
    },
    {
      id: 'q4',
      category: 'eligibility',
      question: 'Is there a limit to how many plots one person can own on tribal land?',
      answer: 'Yes. The law provides that no person must own more than one plot in tribal land. This is the one-plot-per-settlement-type policy, and it is enforced through list-cleaning exercises. The policy means you can only have one plot per settlement type — one in a city, one in a town/village, and one farm plot. Owning a plot already — whether in Kgatleng or any other district — disqualifies you from receiving another tribal land residential plot through a Land Board.',
      source: 'Botswana Land Policy 2019'
    },
    {
      id: 'q5',
      category: 'eligibility',
      question: 'Does the Botswana Land Policy provide special consideration for disadvantaged groups?',
      answer: 'Yes. The Botswana Land Policy of 2019 recognises disadvantaged members of society including remote area dwellers, widows, orphans, youth, people with disabilities, and the needy. However, an individual does not automatically qualify by falling within these groups—an assessment must be made by social welfare officers. In the past five years, 9,066 people with special needs were assisted (207 people with disabilities, 130 orphans, 7,733 youth, and 996 registered needy people).',
      source: 'Botswana Land Policy 2019'
    },

    // ==================== SECTION 2: APPLICATION PROCESS ====================
    {
      id: 'q6',
      category: 'process',
      question: 'How do I apply for a tribal land plot?',
      answer: 'You submit the Application for Customary Land Rights form to your relevant Sub-Land Board. The form requires personal details, proof of citizenship (Omang), marital status documentation, proposed land use, and a declaration of accuracy. Upon allocation, the plot holder is issued with a Deed of Customary Land Grant printed on paper with special security features. False information results in rejection, prosecution, or forfeiture of the plot.',
      source: 'gov.bw/land-management/allocation-tribal-land'
    },
    {
      id: 'q7',
      category: 'process',
      question: 'What documents are required when applying?',
      answer: 'Required documents include: Certified copy of Omang/ID; Copy of instrument signed under Married Persons Property Act (proof of marriage regime if married; affidavit if not married); Decree absolute and court order where applicable; Death certificate (if widow/widower); Copy of Disability Card (for people with disabilities); Confirmation letter and assessment report from District Council (for disadvantaged groups); Share certificate (for companies).',
      source: 'Tribal Land Act (Cap. 32:02)'
    },
    {
      id: 'q8',
      category: 'process',
      question: 'How does the Land Board decide whether to grant my application?',
      answer: 'The Land Board considers: whether the applicant is a citizen of Botswana; whether the land is subject to rights in favour of any other person; whether the land is available; and whether its size and location are suitable for the use proposed by the applicant. If it is proposed to make a grant of customary rights, a resolution to that effect, including any conditions, is put to the subordinate land board, and if passed it is recorded in the minutes of that meeting.',
      source: 'Tribal Land Act (Cap. 32:02)'
    },
    {
      id: 'q9',
      category: 'process',
      question: 'How much does it cost to apply for tribal land?',
      answer: 'The application fees are as follows: P150 for preparation of a sketch plan, P10 Application fee, P100 lease preparation (for business/agricultural plots), and P60 once-off payment for a residential plot. These fees are payable when submitting your application.',
      source: 'Tribal Land Act (Cap. 32:02)'
    },
    {
      id: 'q10',
      category: 'process',
      question: 'What are the lease charges after allocation?',
      answer: 'Lease charges vary by land use: Residential Lease: BWP60 flat rate (once-off); Commercial Rent: BWP0.25 per square metre per annum; Industrial: BWP0.10 per square metre per annum; Agricultural Lease: BWP500 for first five hectares, BWP15 per remaining hectare per annum; Surface Rights: BWP0.08 per square metre per month.',
      source: 'Tribal Land Act (Cap. 32:02)'
    },

    // ==================== SECTION 3: THE WAITING LIST ====================
    {
      id: 'q11',
      category: 'waiting',
      question: 'Why is the waiting list so long?',
      answer: 'The scale of demand is enormous and structural. Parliament has been informed that the Land Information System shows 687,486 people eligible under the Botswana Land Policy of 2019 are currently awaiting land allocation nationally, indicating the magnitude of national demand for serviced and titled land. The problem is compounded by the fact that many applicants have registered at multiple Land Boards simultaneously, inflating the raw numbers significantly.',
      source: 'Botswana Daily News, February 2026'
    },
    {
      id: 'q12',
      category: 'waiting',
      question: 'How long can I expect to wait?',
      answer: 'There is no official guaranteed waiting period. Allocation depends entirely on when surveyed, serviced, and available land is identified in your area of application. Where a waiting list exists, plots are allocated to qualifying applicants when land becomes available, and citizens are informed through local media and public forums such as Kgotla meetings. In practice, many applicants in high-pressure areas like Gaborone and Kgatleng have been waiting for decades.',
      source: 'Botswana Land Policy 2019'
    },
    {
      id: 'q13',
      category: 'waiting',
      question: 'Can I be removed from the waiting list without being told?',
      answer: 'Yes. Kweneng Land Board Chairman Kgang Kgang noted that some waiting lists are just "application lists" because people get disqualified and struck out as allocations proceed. You can be disqualified from allocation if it is discovered you already own a tribal land plot elsewhere. Kgatleng Land Board found that 50,000 of its 200,000+ listed applicants were already disqualified because they had been allocated a rural plot within Kgatleng or elsewhere in the country.',
      source: 'Botswana Daily News'
    },
    {
      id: 'q14',
      category: 'waiting',
      question: 'Do youth receive preferential treatment in land allocation?',
      answer: 'Yes. Youth are normally accorded preferential treatment where they have been approved for economic empowerment programmes that need land. This is part of the government\'s commitment to supporting youth development and economic participation.',
      source: 'Botswana Land Policy 2019'
    },

    // ==================== SECTION 4: ALLOCATION & WHAT HAPPENS AFTER ====================
    {
      id: 'q15',
      category: 'allocation',
      question: 'Is tribal land allocated free of charge?',
      answer: 'Yes, for residential plots. Land allocated by a Land Board is allocated free of charge to citizens. The allottee is issued with a customary grant certificate which guarantees that land "ownership" shall be perpetual as long as the allottee remains in occupation. The ultimate ownership of the land vests with the Land Board, which holds the land in trust. However, for commercial plots, plot holders on tribal land are issued with a lease agreement for a specified period of time and are expected to pay annual lease rentals, except for residential purposes which is a once-off payment.',
      source: 'Tribal Land Act (Cap. 32:02)'
    },
    {
      id: 'q16',
      category: 'allocation',
      question: 'What is the difference between a Customary Land Grant and a Secure Land Title (SLT)?',
      answer: 'A Customary Land Grant (the old certificate) confirmed your right to the land but had limited financial utility. The previous arrangement of ordinary customary land grant certificates limited the extent to which land holders could benefit from their land. With the new Secure Land Title, individual Batswana can directly use the SLT as security to access financial assistance from financial institutions — described as a major step in unlocking the economic potential of tribal land. An SLT holder has an internationally recognised document that can be used to access funds for development and used as collateral for accessing funding for other businesses.',
      source: 'Botswana Daily News'
    },
    {
      id: 'q17',
      category: 'allocation',
      question: 'Who holds title to tribal land?',
      answer: 'Tribal land is vested in Land Boards, who hold it in trust for the benefit and advantage of citizens of Botswana. The rights and title to land have been vested on the Land Boards, which act as custodians of tribal land on behalf of the citizens.',
      source: 'Tribal Land Act (Cap. 32:02)'
    },
    {
      id: 'q18',
      category: 'allocation',
      question: 'Can I change the use of my allocated land?',
      answer: 'Yes, but you must obtain consent from the Land Board. Section 5 of the Tribal Land Act 2018 provides that the Land Board must authorise any change of use of tribal land following the granting of rights to use the land. Submission to the district council is also required for compliance with district development plans.',
      source: 'Tribal Land Act 2018'
    },
    {
      id: 'q19',
      category: 'allocation',
      question: 'Can I return a plot I was allocated?',
      answer: 'Yes, but it has consequences for future applications. During the national 100,000 plots campaign, 2,473 plots were returned to Land Authorities by allottees, primarily because applicants wished to avoid being disqualified from future land allocations in their preferred or respective areas of application. If you return a plot, you remain eligible to reapply, but your queue position is forfeited.',
      source: 'Mmegi Online'
    },

    // ==================== SECTION 5: COMMERCIAL & AGRICULTURAL LAND ====================
    {
      id: 'q20',
      category: 'commercial',
      question: 'Can I apply for commercial land through a Land Board?',
      answer: 'Yes. Commercial land applications are for business ventures. Plot holders on tribal land are issued with a lease agreement for a specified period and must pay annual lease rentals. When plots are available, they are advertised to the public. There are no pending applications for commercial plots at most Land Boards because they are only advertised when they are readily available for allocation.',
      source: 'Tribal Land Act (Cap. 32:02)'
    },
    {
      id: 'q21',
      category: 'commercial',
      question: 'What purposes can I apply for?',
      answer: 'A Memorandum of Agreement of Lease may be issued for the following purposes: mining activities, agricultural activities, industrial activities, commercial activities, tourism, civic and communities, residential for non-citizens, residential for citizens, wildlife and bird sanctuaries.',
      source: 'Tribal Land Act (Cap. 32:02)'
    },
    {
      id: 'q22',
      category: 'commercial',
      question: 'What about applying for agricultural/farming land (masimo)?',
      answer: 'Agricultural land applications are tracked separately. In Kgatleng Land Board alone, as of a recent parliamentary answer, total pending agricultural or farming land applications were 12,854 across four sub-land boards: 5,992 for Mochudi, 5,814 for Artesia, 532 for Oodi, and 516 for Mathubudukwane.',
      source: 'Botswana Daily News'
    },

    // ==================== SECTION 6: DISPUTES, APPEALS & LAND TRIBUNAL ====================
    {
      id: 'q23',
      category: 'disputes',
      question: 'What is the Land Tribunal and what does it do?',
      answer: 'The Land Tribunal is a specialised court created under the Land Tribunal Act No.4 of 2014. It hears and determines appeals arising from decisions of Land Boards under Sections 14 and 40 of the Tribal Land Act. It also hears planning appeals from Physical Planning Committees of District Councils. You can escalate unresolved disputes from the Land Board to the Land Tribunal, and further to the courts.',
      source: 'Land Tribunal Act No.4 of 2014'
    },
    {
      id: 'q24',
      category: 'disputes',
      question: 'What are the characteristics of the Land Tribunal?',
      answer: 'The Land Tribunal is a Court of Law and Equity with the following attributes: speed (cases are handled expeditiously), affordability (low costs), flexibility (no rigid procedures), less technical procedures, accessibility (open to all), and simplicity (easy to navigate).',
      source: 'Land Tribunal Act No.4 of 2014'
    },
    {
      id: 'q25',
      category: 'disputes',
      question: 'What matters CANNOT be heard by the Land Tribunal?',
      answer: 'The Land Tribunal cannot hear: issues of amount of compensation; inheritance issues; enforcement of transfer/sale contracts; matters already concluded by other courts; issues concerning public bodies\' delays; disputes involving state and freehold land (except planning issues).',
      source: 'Land Tribunal Act No.4 of 2014'
    },
    {
      id: 'q26',
      category: 'disputes',
      question: 'Where are Land Tribunal divisions located?',
      answer: 'The Land Tribunal has divisions across Botswana: Gaborone Division at Plot 21 Corner of Khama Crescent and Queens Road; Palapye Division at Plot 19668/74, Lotsane Junction Mall; Francistown Division at Plot 252, 6167 Khutse Crescent; and Maun Division at Plot 465 Boseja Ward.',
      source: 'Land Tribunal Botswana'
    },
    {
      id: 'q27',
      category: 'disputes',
      question: 'How many disputes are currently pending before Land Boards?',
      answer: 'Kgatleng Land Board alone had a caseload of 457 disputes pending before the main land board and its subordinate land boards, and 90 before the courts, making a total of 547 pending dispute cases. This figure reflects just one district, so the national backlog is substantially higher.',
      source: 'Botswana Daily News'
    },

    // ==================== SECTION 7: CURRENT REFORMS & WHAT TO EXPECT ====================
    {
      id: 'q28',
      category: 'reforms',
      question: 'What reforms are currently underway?',
      answer: 'The Tribal Land Act of 2018 repealed the 1968 Act, which had been in force since 1970. The 1968 Act faced challenges including unsurveyed and unplanned allocations, unregistered customary land grants, and poor records management. The new Act aims to address these through the National Land Policy of 2015, which provides for registration of customary land grants, survey of all land, declaration of the whole country as a planning area, and development of a Land Information System.',
      source: 'Tribal Land Act 2018'
    },
    {
      id: 'q29',
      category: 'reforms',
      question: 'What is the government\'s target for land allocation?',
      answer: 'The Ministry of Lands and Water Affairs had a target to allocate a minimum of 100,000 plots by the end of the 2022/23 financial year. Kweneng Land Board alone was tasked to allocate approximately 11,000 plots toward this national target. The target was officially achieved by June 2024.',
      source: 'Botswana Daily News'
    },
    {
      id: 'q30',
      category: 'reforms',
      question: 'What challenges do Land Boards face in allocation?',
      answer: 'Land Boards face several challenges including: applicants not showing up when called for interviews; squatters refusing to vacate land occupied illegally; and corruption. In Kweneng, 38 suspended employees were found to have taken people\'s ploughing fields and plot certificates.',
      source: 'Africa Press'
    },
    {
      id: 'q31',
      category: 'reforms',
      question: 'How many people have actually received a Secure Land Title so far?',
      answer: 'Very few relative to those allocated land. Of the 100,000 plots allocated under the national campaign, only 12,586 beneficiaries had received Secure Land Titles by early 2026, a gap attributed to systemic constraints in data readiness and the registration pipeline.',
      source: 'AllAfrica, February 2026'
    }
  ];

  const filteredFaqs = faqData.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) return category.icon;
    return HelpCircle;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#F5E6D3] to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#2C1810] to-[#3d2418] text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
              Frequently Asked Questions
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto text-lg">
              Find answers to common questions about tribal land applications, waiting lists, allocations, and the land reform process in Botswana.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B45F3A] focus:border-transparent shadow-sm"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              const count = faqData.filter(f => category.id === 'all' || f.category === category.id).length;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isActive
                      ? 'bg-[#2C1810] text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                  <span className={`text-xs ${isActive ? 'bg-white/20' : 'bg-gray-100'} px-1.5 py-0.5 rounded-full`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* FAQ Accordion */}
          <div className="max-w-4xl mx-auto">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No questions found matching your search.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('all');
                  }}
                  className="mt-4 text-[#B45F3A] hover:text-[#2C1810]"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFaqs.map((faq) => {
                  const isOpen = openSections[faq.id];
                  const CategoryIcon = getCategoryIcon(faq.category);
                  return (
                    <div key={faq.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                      <button
                        onClick={() => toggleSection(faq.id)}
                        className="w-full text-left p-6 flex justify-between items-start gap-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CategoryIcon className="w-4 h-4 text-[#B45F3A]" />
                            <span className="text-xs text-gray-400 uppercase tracking-wider">
                              {categories.find(c => c.id === faq.category)?.name}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">{faq.question}</h3>
                        </div>
                        <div className="flex-shrink-0">
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                          {faq.source && (
                            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                              <BookOpen className="w-3 h-3" />
                              <span>Source: {faq.source}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Still Have Questions? */}
          <div className="mt-16 bg-gradient-to-r from-[#F5E6D3] to-white rounded-2xl p-8 text-center border border-[#B45F3A]/20">
            <h3 className="text-xl font-bold text-[#2C1810] mb-2">Still have questions?</h3>
            <p className="text-gray-600 mb-6">Can't find the answer you're looking for? We're here to help.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="/contact" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#2C1810] text-white rounded-lg hover:bg-[#3d2418] transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contact Support
              </a>
              <a 
                href="/apply" 
                className="inline-flex items-center gap-2 px-6 py-3 border border-[#B45F3A] text-[#B45F3A] rounded-lg hover:bg-[#B45F3A]/10 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Start Your Application
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQPage;