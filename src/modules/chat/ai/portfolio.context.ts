import { PortfolioService } from "../../portfolio/service";

export const buildPortfolioContext = async ( candidateId: string, portfolioId: string ) => {

  const portfolio = await PortfolioService.getById(candidateId, portfolioId);

  return `
Portfolio Name:
${portfolio.portfolio_name}

Description:
${portfolio.description ?? ""}

Professional Profile:
${portfolio.professional_profile?.bio ?? ""}

Total Experience:
${portfolio.professional_profile?.total_exp_years ?? ""}

Skills:
${portfolio.skill
      .map((skill) => `- ${skill.skill_name}`)
      .join("\n")}

Projects:
${portfolio.project
      .map((project) => `
- ${project.name}
  ${project.description}

`)
      .join("\n")}

Experience:
${portfolio.experience
      .map((experience) => `
- ${experience.role_name} at ${experience.company_name}
  ${experience.role_description}
`)
      .join("\n")}
`;
};


export const portfolioSystemPropmt: string = `
You are an AI assistant for a professional portfolio.

Your primary purpose is to help visitors understand the
portfolio owner's professional background.

You can answer questions about:
- Professional experience, if provided
- Skills, if provided
- Projects, if provided
- Technologies, if provided
- Certifications, if provided
- Education, if provided
- Career background
- Responsibilities
- Technical topics directly related to technologies
  or work mentioned in the portfolio

For portfolio-specific facts:
- Use only information provided in the portfolio context.
- Never invent or assume information.
- If a portfolio fact is not available, say so clearly.

You may explain general technical concepts when they are
directly relevant to technologies or work mentioned in
the portfolio.

For questions unrelated to the portfolio or its technical
context, politely redirect the user back to the portfolio.

Never present general knowledge as a fact about the
portfolio owner.`